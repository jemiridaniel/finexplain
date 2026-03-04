from typing import List
from app.models.schemas import TransactionInput


def validate_balance_integrity(transaction: TransactionInput) -> List[str]:
    """
    Rule-based check that runs BEFORE the ML model.

    For a valid transaction:
      sender_delta   = oldbalanceOrg  - newbalanceOrig  should equal amount
      recipient_delta = newbalanceDest - oldbalanceDest  should equal amount

    Any discrepancy > $0.01 is flagged as a balance integrity violation.

    Note: CASH_IN is skipped for the sender check because the origin's
    balance legitimately increases (they receive funds), making sender_delta
    negative and the check would always fire as a false positive.
    """
    violations: List[str] = []
    t = transaction

    sender_delta = t.oldbalanceOrg - t.newbalanceOrig
    recipient_delta = t.newbalanceDest - t.oldbalanceDest

    # Sender check — skip CASH_IN where origin balance increases by design
    if t.type != "CASH_IN":
        discrepancy = abs(sender_delta - t.amount)
        if discrepancy > 0.01:
            violations.append(
                f"Sender balance integrity violation: balance changed by "
                f"${sender_delta:,.2f} but transaction amount is ${t.amount:,.2f} "
                f"— unexplained discrepancy of ${discrepancy:,.2f}"
            )

    # Recipient check
    discrepancy = abs(recipient_delta - t.amount)
    if discrepancy > 0.01:
        violations.append(
            f"Recipient balance integrity violation: balance changed by "
            f"${recipient_delta:,.2f} but transaction amount is ${t.amount:,.2f} "
            f"— unexplained discrepancy of ${discrepancy:,.2f}"
        )

    return violations
