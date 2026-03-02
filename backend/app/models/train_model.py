import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import LabelEncoder
import joblib
from pathlib import Path

print("Loading PaySim dataset...")
df = pd.read_csv("/Users/danieljemiri/Desktop/Personal Project/finexplain/data/PS_20174392719_1491204439457_log.csv")

# Keep only TRANSFER and CASH_OUT — where fraud actually occurs
# But train on ALL types so model learns normal patterns
encoder = LabelEncoder()
encoder.fit(["CASH_IN", "CASH_OUT", "DEBIT", "PAYMENT", "TRANSFER"])
df["type_encoded"] = encoder.transform(df["type"])

# Engineer the same features the detector uses
df["balance_delta_orig"] = df["newbalanceOrig"] - df["oldbalanceOrg"]
df["balance_delta_dest"] = df["newbalanceDest"] - df["oldbalanceDest"]
df["amount_to_orig_ratio"] = df.apply(
    lambda r: r["amount"] / r["oldbalanceOrg"] if r["oldbalanceOrg"] > 0 else 1.0,
    axis=1
)

features = [
    "type_encoded", "amount", "oldbalanceOrg", "newbalanceOrig",
    "oldbalanceDest", "newbalanceDest", "balance_delta_orig",
    "balance_delta_dest", "amount_to_orig_ratio"
]

# Sample 200K rows for training (full dataset is 6M rows)
sample = df[features].sample(n=200_000, random_state=42)

print("Training Isolation Forest on 200K real transactions...")
model = IsolationForest(
    n_estimators=200,
    contamination=0.02,   # ~2% of real transactions are fraud
    random_state=42,
    max_features=1.0,
    n_jobs=-1
)
model.fit(sample)

Path("app/models").mkdir(parents=True, exist_ok=True)
joblib.dump(model, "app/models/isolation_forest.pkl")
print("✅ Model saved to app/models/isolation_forest.pkl")

# Quick sanity check
test_normal = pd.DataFrame([{
    "type_encoded": 3,  # PAYMENT
    "amount": 120.5,
    "oldbalanceOrg": 5000,
    "newbalanceOrig": 4879.5,
    "oldbalanceDest": 2000,
    "newbalanceDest": 2120.5,
    "balance_delta_orig": -120.5,
    "balance_delta_dest": 120.5,
    "amount_to_orig_ratio": 0.024
}])

test_suspicious = pd.DataFrame([{
    "type_encoded": 4,  # TRANSFER
    "amount": 9000.60,
    "oldbalanceOrg": 9000.60,
    "newbalanceOrig": 0,
    "oldbalanceDest": 0,
    "newbalanceDest": 0,
    "balance_delta_orig": -9000.60,
    "balance_delta_dest": 0,
    "amount_to_orig_ratio": 1.0
}])

print(f"\nSanity check:")
print(f"Normal payment score:      {model.score_samples(test_normal)[0]:.4f}  (expect > -0.3)")
print(f"Suspicious transfer score: {model.score_samples(test_suspicious)[0]:.4f} (expect < -0.3)")