import numpy as np
from typing import List, Tuple

from app.models.schemas import TransactionInput


def compute_behavioral_profile(transactions: List[TransactionInput]) -> dict:
    """Compute a behavioral baseline from the account's transaction history."""
    amounts = [t.amount for t in transactions]
    types = [t.type for t in transactions]

    mean_amount = float(np.mean(amounts))
    std_amount = float(np.std(amounts)) if len(amounts) > 1 else 1.0
    max_amount = float(max(amounts))

    type_counts: dict = {}
    for t in types:
        type_counts[t] = type_counts.get(t, 0) + 1
    common_types = sorted(type_counts.keys(), key=lambda x: -type_counts[x])

    return {
        "total": len(transactions),
        "mean_amount": mean_amount,
        "std_amount": max(std_amount, 1.0),  # avoid div-by-zero
        "max_amount": max_amount,
        "common_types": common_types,
        "type_counts": type_counts,
        "avg_daily": len(transactions) / 14.0,
    }


def score_behavioral_risk(
    transaction: TransactionInput,
    profile: dict,
) -> Tuple[float, List[str]]:
    """
    Score a transaction against the account's own behavioral baseline.
    Returns (risk_score 0–1, list of human-readable flags).
    """
    flags: List[str] = []
    risk = 0.0

    # --- Amount z-score ---
    zscore = (transaction.amount - profile["mean_amount"]) / profile["std_amount"]
    if zscore > 3:
        flags.append(
            f"Amount (${transaction.amount:,.2f}) is {zscore:.1f}x standard deviations above "
            f"this account's average (${profile['mean_amount']:,.2f})"
        )
        risk += min(0.5, zscore / 10)

    # --- Exceeds historical maximum ---
    if transaction.amount > profile["max_amount"] * 1.5:
        flags.append(
            f"Largest transaction for this account — ${transaction.amount:,.2f} exceeds "
            f"the previous maximum of ${profile['max_amount']:,.2f}"
        )
        risk += 0.3

    # --- Unusual transaction type ---
    top_types = profile["common_types"][:2]
    if top_types and transaction.type not in top_types:
        flags.append(
            f"'{transaction.type}' is not among this account's typical transaction types "
            f"({', '.join(top_types)})"
        )
        risk += 0.2

    return min(risk, 1.0), flags
