from pydantic import BaseModel, Field
from typing import Optional, List, Dict


class TransactionInput(BaseModel):
    type: str = Field(..., example="TRANSFER", description="Transaction type: CASH_IN, CASH_OUT, DEBIT, PAYMENT, TRANSFER")
    amount: float = Field(..., example=9000.60, gt=0)
    oldbalanceOrg: float = Field(..., example=9000.60)
    newbalanceOrig: float = Field(..., example=0.0)
    oldbalanceDest: float = Field(..., example=0.0)
    newbalanceDest: float = Field(..., example=0.0)
    nameOrig: Optional[str] = Field(default="C_unknown", example="C123456789")
    nameDest: Optional[str] = Field(default="M_unknown", example="M987654321")

    class Config:
        json_schema_extra = {
            "example": {
                "type": "TRANSFER",
                "amount": 9000.60,
                "oldbalanceOrg": 9000.60,
                "newbalanceOrig": 0.0,
                "oldbalanceDest": 0.0,
                "newbalanceDest": 0.0,
                "nameOrig": "C123456789",
                "nameDest": "M987654321"
            }
        }


class SHAPFeature(BaseModel):
    feature: str
    value: float
    shap_value: float
    direction: str  # "increases_risk" | "decreases_risk"


class AnalysisResult(BaseModel):
    transaction: TransactionInput
    anomaly_score: float
    is_anomaly: bool
    risk_level: str  # HIGH | MEDIUM | LOW
    shap_values: List[SHAPFeature]
    explanation: Optional[str] = None
    llm_provider: Optional[str] = None


class BulkAnalysisResult(BaseModel):
    total: int
    flagged: int
    results: List[AnalysisResult]
