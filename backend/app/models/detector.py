import joblib
import numpy as np
import pandas as pd
from pathlib import Path
from sklearn.ensemble import GradientBoostingClassifier, IsolationForest
from sklearn.preprocessing import LabelEncoder

from app.models.schemas import TransactionInput
from app.core.config import settings

TRANSACTION_TYPES = ["CASH_IN", "CASH_OUT", "DEBIT", "PAYMENT", "TRANSFER"]


class AnomalyDetector:
    def __init__(self):
        self.encoder = LabelEncoder()
        self.encoder.fit(TRANSACTION_TYPES)
        self.model = None
        self.mode = "classifier"  # "classifier" or "isolation_forest"
        self._load()

    def _load(self):
        classifier_path = Path("app/models/fraud_classifier.pkl")
        isolation_path = Path(settings.MODEL_PATH)

        if classifier_path.exists():
            self.model = joblib.load(classifier_path)
            self.mode = "classifier"
            print(f"Loaded classifier: {classifier_path}")
        elif isolation_path.exists():
            self.model = joblib.load(isolation_path)
            self.mode = "isolation_forest"
            print(f"Loaded isolation forest: {isolation_path}")
        else:
            self._train_default()

    def _train_default(self):
        np.random.seed(42)
        n = 5000
        amounts = np.abs(np.random.exponential(50000, n))
        old_orig = np.abs(np.random.exponential(100000, n))
        new_orig = np.maximum(old_orig - amounts, 0)
        old_dest = np.abs(np.random.exponential(50000, n))
        new_dest = old_dest + amounts
        data = pd.DataFrame({
            "type_encoded": np.random.randint(0, 5, n),
            "amount": amounts,
            "oldbalanceOrg": old_orig,
            "newbalanceOrig": new_orig,
            "oldbalanceDest": old_dest,
            "newbalanceDest": new_dest,
            "balance_delta_orig": new_orig - old_orig,
            "balance_delta_dest": new_dest - old_dest,
            "amount_to_orig_ratio": np.where(old_orig > 0, amounts / old_orig, 1.0),
            "orig_drained": (new_orig == 0).astype(int),
            "dest_no_increase": (new_dest <= old_dest).astype(int),
            "amount_equals_balance": (np.abs(amounts - old_orig) < 1).astype(int),
            "orig_balance_error": np.abs((old_orig - amounts) - new_orig),
            "dest_balance_error": np.abs((old_dest + amounts) - new_dest),
        })
        self.model = IsolationForest(n_estimators=100, contamination=0.01, random_state=42)
        self.model.fit(data)
        self.mode = "isolation_forest"

    def _prepare_features(self, transaction: TransactionInput) -> pd.DataFrame:
        try:
            type_encoded = self.encoder.transform([transaction.type])[0]
        except ValueError:
            type_encoded = 0

        amount   = transaction.amount
        old_orig = transaction.oldbalanceOrg
        new_orig = transaction.newbalanceOrig
        old_dest = transaction.oldbalanceDest
        new_dest = transaction.newbalanceDest

        return pd.DataFrame([{
            "type_encoded":           type_encoded,
            "amount":                 amount,
            "oldbalanceOrg":          old_orig,
            "newbalanceOrig":         new_orig,
            "oldbalanceDest":         old_dest,
            "newbalanceDest":         new_dest,
            "balance_delta_orig":     new_orig - old_orig,
            "balance_delta_dest":     new_dest - old_dest,
            "amount_to_orig_ratio":   amount / old_orig if old_orig > 0 else 1.0,
            "orig_drained":           int(new_orig == 0),
            "dest_no_increase":       int(new_dest <= old_dest),
            "amount_equals_balance":  int(abs(amount - old_orig) < 1),
            "orig_balance_error":     abs((old_orig - amount) - new_orig),
            "dest_balance_error":     abs((old_dest + amount) - new_dest),
        }])

    def predict(self, transaction: TransactionInput) -> tuple[float, bool]:
        features = self._prepare_features(transaction)

        if self.mode == "classifier":
            # Returns fraud probability 0.0 → 1.0
            prob = float(self.model.predict_proba(features)[0][1])
            is_anomaly = prob > 0.5
            # Convert to negative score to keep UI consistent (higher prob = lower score)
            score = -prob
        else:
            score = float(self.model.score_samples(features)[0])
            is_anomaly = score < settings.ANOMALY_THRESHOLD

        return score, is_anomaly

    def get_feature_names(self):
        return [
            "type_encoded", "amount", "oldbalanceOrg", "newbalanceOrig",
            "oldbalanceDest", "newbalanceDest", "balance_delta_orig",
            "balance_delta_dest", "amount_to_orig_ratio",
            "orig_drained", "dest_no_increase", "amount_equals_balance",
            "orig_balance_error", "dest_balance_error"
        ]