import asyncio
from dataclasses import dataclass
from typing import List, Optional
from groq import AsyncGroq
import anthropic
from openai import AsyncOpenAI

from app.core.config import settings
from app.models.schemas import TransactionInput, SHAPFeature


@dataclass
class ExplanationResult:
    text: str
    provider: str


def _build_prompt(
    transaction: TransactionInput,
    score: float,
    shap_values: List[SHAPFeature],
    is_anomaly: bool
) -> str:
    top_factors = shap_values[:4]
    factors_text = "\n".join([
        f"  - {f.feature}: {f.value} (impact: {'+' if f.direction == 'decreases_risk' else '-'}{abs(f.shap_value):.3f})"
        for f in top_factors
    ])

    risk = "HIGH" if score < -0.3 else "MEDIUM" if score < -0.1 else "LOW"

    return f"""You are a financial fraud analyst AI. Explain the following transaction analysis result to a non-technical user in 3-4 clear, specific sentences.

Transaction details:
- Type: {transaction.type}
- Amount: ${transaction.amount:,.2f}
- Sender opening balance: ${transaction.oldbalanceOrg:,.2f}
- Sender closing balance: ${transaction.newbalanceOrig:,.2f}
- Recipient opening balance: ${transaction.oldbalanceDest:,.2f}
- Recipient closing balance: ${transaction.newbalanceDest:,.2f}

Anomaly score: {score:.4f} (lower = more suspicious)
Risk level: {risk}
Flagged as anomaly: {is_anomaly}

Top contributing factors:
{factors_text}

Write a plain-English explanation of why this transaction {"was flagged" if is_anomaly else "appears normal"}. Be specific about the numbers. Do not use jargon. Start with the most important reason."""


class LLMService:
    def __init__(self):
        self.groq = AsyncGroq(api_key=settings.GROQ_API_KEY) if settings.GROQ_API_KEY else None
        self.anthropic = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY) if settings.ANTHROPIC_API_KEY else None
        self.openai = AsyncOpenAI(api_key=settings.OPENAI_API_KEY) if settings.OPENAI_API_KEY else None

    async def explain(
        self,
        transaction: TransactionInput,
        score: float,
        shap_values: List[SHAPFeature],
        is_anomaly: bool
    ) -> ExplanationResult:
        prompt = _build_prompt(transaction, score, shap_values, is_anomaly)

        # Try each provider in order — fail gracefully to next
        providers = [
            ("Groq", self._call_groq),
            ("Claude", self._call_claude),
            ("OpenAI", self._call_openai),
        ]

        last_error: Optional[Exception] = None
        for name, fn in providers:
            try:
                text = await fn(prompt)
                return ExplanationResult(text=text, provider=name)
            except Exception as e:
                last_error = e
                continue

        # All providers failed — return a rule-based fallback
        return ExplanationResult(
            text=self._rule_based_fallback(transaction, score, shap_values, is_anomaly),
            provider="Rule-based fallback"
        )

    async def _call_groq(self, prompt: str) -> str:
        if not self.groq:
            raise ValueError("Groq client not configured")
        response = await self.groq.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=300,
            temperature=0.3,
        )
        return response.choices[0].message.content.strip()

    async def _call_claude(self, prompt: str) -> str:
        if not self.anthropic:
            raise ValueError("Anthropic client not configured")
        response = await self.anthropic.messages.create(
            model=settings.ANTHROPIC_MODEL,
            max_tokens=300,
            messages=[{"role": "user", "content": prompt}]
        )
        return response.content[0].text.strip()

    async def _call_openai(self, prompt: str) -> str:
        if not self.openai:
            raise ValueError("OpenAI client not configured")
        response = await self.openai.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=300,
            temperature=0.3,
        )
        return response.choices[0].message.content.strip()

    def _rule_based_fallback(
        self,
        transaction: TransactionInput,
        score: float,
        shap_values: List[SHAPFeature],
        is_anomaly: bool
    ) -> str:
        if not is_anomaly:
            return f"This {transaction.type} transaction of ${transaction.amount:,.2f} appears normal based on the account's historical patterns."

        top = shap_values[0] if shap_values else None
        reason = f"primarily driven by {top.feature.lower()}" if top else "based on multiple unusual patterns"
        balance_diff = abs(transaction.newbalanceOrig - transaction.oldbalanceOrg)

        return (
            f"This {transaction.type} transaction of ${transaction.amount:,.2f} was flagged as suspicious, "
            f"{reason}. The sender's balance changed by ${balance_diff:,.2f}, which is outside normal patterns. "
            f"The anomaly score of {score:.3f} indicates this transaction deviates significantly from typical activity. "
            f"Manual review is recommended."
        )
