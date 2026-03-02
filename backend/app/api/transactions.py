from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse
from typing import List
import pandas as pd
import io

from app.models.schemas import TransactionInput, AnalysisResult, BulkAnalysisResult
from app.models.detector import AnomalyDetector
from app.services.explainer import SHAPExplainer
from app.services.llm_service import LLMService
from app.services.report import ReportGenerator

router = APIRouter()
detector = AnomalyDetector()
explainer = SHAPExplainer()
llm_service = LLMService()
report_gen = ReportGenerator()


@router.post("/analyze", response_model=AnalysisResult)
async def analyze_transaction(transaction: TransactionInput):
    """Analyze a single transaction and return anomaly score + explanation."""
    try:
        # 1. Score transaction
        score, is_anomaly = detector.predict(transaction)

        # 2. Get SHAP explanation
        shap_values = explainer.explain(transaction)

        # 3. Generate LLM explanation
        explanation = await llm_service.explain(
            transaction=transaction,
            score=score,
            shap_values=shap_values,
            is_anomaly=is_anomaly
        )

        return AnalysisResult(
            transaction=transaction,
            anomaly_score=score,
            is_anomaly=is_anomaly,
            shap_values=shap_values,
            explanation=explanation.text,
            llm_provider=explanation.provider,
            risk_level=_risk_level(score)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/analyze/bulk", response_model=BulkAnalysisResult)
async def analyze_bulk(file: UploadFile = File(...)):
    """Upload a CSV and analyze all transactions."""
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported.")

    contents = await file.read()
    try:
        df = pd.read_csv(io.StringIO(contents.decode("utf-8")))
    except Exception:
        raise HTTPException(status_code=400, detail="Could not parse CSV file.")

    required_cols = {"type", "amount", "oldbalanceOrg", "newbalanceOrig",
                     "oldbalanceDest", "newbalanceDest"}
    if not required_cols.issubset(df.columns):
        raise HTTPException(
            status_code=400,
            detail=f"CSV must contain columns: {required_cols}"
        )

    results = []
    for _, row in df.head(50).iterrows():  # cap at 50 rows for demo
        txn = TransactionInput(**row.to_dict())
        score, is_anomaly = detector.predict(txn)
        shap_values = explainer.explain(txn)

        explanation = None
        if is_anomaly:
            exp = await llm_service.explain(txn, score, shap_values, is_anomaly)
            explanation = exp.text

        results.append(AnalysisResult(
            transaction=txn,
            anomaly_score=score,
            is_anomaly=is_anomaly,
            shap_values=shap_values,
            explanation=explanation,
            risk_level=_risk_level(score)
        ))

    flagged = [r for r in results if r.is_anomaly]
    return BulkAnalysisResult(
        total=len(results),
        flagged=len(flagged),
        results=results
    )


@router.post("/report")
async def download_report(results: List[AnalysisResult]):
    """Generate and download a PDF report of flagged transactions."""
    pdf_bytes = report_gen.generate(results)
    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=finexplain_report.pdf"}
    )


def _risk_level(score: float) -> str:
    prob = abs(score)
    if prob > 0.7:
        return "HIGH"
    elif prob > 0.3:
        return "MEDIUM"
    return "LOW"
