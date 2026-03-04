from fastapi import APIRouter, HTTPException

from app.models.schemas import (
    AccountHistoryRequest,
    AccountAnalysisResult,
    AccountTransactionResult,
)
from app.models.detector import AnomalyDetector
from app.services.explainer import SHAPExplainer
from app.services.llm_service import LLMService
from app.services.account_analyzer import compute_behavioral_profile, score_behavioral_risk

router = APIRouter()
detector = AnomalyDetector()
explainer = SHAPExplainer()
llm_service = LLMService()


@router.post("/analyze/account", response_model=AccountAnalysisResult)
async def analyze_account_history(request: AccountHistoryRequest):
    """
    Analyze a 2-week transaction history for one account.
    Detects both globally suspicious transactions AND behaviorally anomalous ones
    (transactions that deviate from this account's own patterns).
    """
    if len(request.transactions) < 2:
        raise HTTPException(
            status_code=400,
            detail="At least 2 transactions required for account history analysis."
        )

    try:
        profile = compute_behavioral_profile(request.transactions)
        results: list[AccountTransactionResult] = []

        for txn in request.transactions:
            score, is_model_anomaly = detector.predict(txn)
            shap_values = explainer.explain(txn)
            behavioral_risk, behavioral_flags = score_behavioral_risk(txn, profile)

            is_anomaly = is_model_anomaly or behavioral_risk > 0.4

            explanation = None
            llm_provider = None
            if is_anomaly:
                exp = await llm_service.explain(txn, score, shap_values, is_anomaly)
                explanation = exp.text
                llm_provider = exp.provider

            results.append(AccountTransactionResult(
                transaction=txn,
                anomaly_score=score,
                is_anomaly=is_anomaly,
                risk_level=_risk_level(score),
                shap_values=shap_values,
                explanation=explanation,
                llm_provider=llm_provider,
                behavioral_risk=round(behavioral_risk, 4),
                behavioral_flags=behavioral_flags,
                behavioral_anomaly=behavioral_risk > 0.4,
            ))

        flagged = [r for r in results if r.is_anomaly]
        narrative = await llm_service.explain_account(request.account_id, profile, flagged)

        return AccountAnalysisResult(
            account_id=request.account_id,
            total_transactions=len(results),
            period_days=14,
            flagged_count=len(flagged),
            mean_amount=round(profile["mean_amount"], 2),
            std_amount=round(profile["std_amount"], 2),
            max_amount=round(profile["max_amount"], 2),
            common_types=profile["common_types"],
            avg_daily_transactions=round(profile["avg_daily"], 2),
            narrative=narrative,
            results=results,
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def _risk_level(score: float) -> str:
    prob = abs(score)
    if prob > 0.7:
        return "HIGH"
    elif prob > 0.3:
        return "MEDIUM"
    return "LOW"
