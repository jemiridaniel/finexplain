import shap
import numpy as np
from app.models.schemas import TransactionInput, SHAPFeature
from app.models.detector import AnomalyDetector
from typing import List

_detector = AnomalyDetector()

FEATURE_LABELS = {
    "type_encoded": "Transaction Type",
    "amount": "Transaction Amount",
    "oldbalanceOrg": "Sender Opening Balance",
    "newbalanceOrig": "Sender Closing Balance",
    "oldbalanceDest": "Recipient Opening Balance",
    "newbalanceDest": "Recipient Closing Balance",
    "balance_delta_orig": "Sender Balance Change",
    "balance_delta_dest": "Recipient Balance Change",
    "amount_to_orig_ratio": "Amount-to-Balance Ratio",
    "orig_drained": "Account Fully Drained",
    "dest_no_increase": "Recipient Balance Unchanged",
    "amount_equals_balance": "Entire Balance Moved",
    "orig_balance_error": "Sender Balance Discrepancy",
    "dest_balance_error": "Recipient Balance Discrepancy",
}


class SHAPExplainer:
    def __init__(self):
        self.explainer = shap.TreeExplainer(_detector.model)

    def explain(self, transaction: TransactionInput) -> List[SHAPFeature]:
        features = _detector._prepare_features(transaction)
        shap_values = self.explainer.shap_values(features)[0]
        feature_names = _detector.get_feature_names()
        feature_values = features.values[0]

        results = []
        for name, val, shap_val in zip(feature_names, feature_values, shap_values):
            results.append(SHAPFeature(
                feature=FEATURE_LABELS.get(name, name),
                value=round(float(val), 4),
                shap_value=round(float(shap_val), 4),
                direction="increases_risk" if shap_val < 0 else "decreases_risk"
            ))

        # Sort by absolute SHAP value — most influential first
        results.sort(key=lambda x: abs(x.shap_value), reverse=True)
        return results
