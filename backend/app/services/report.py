from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from typing import List
import io
from datetime import datetime

from app.models.schemas import AnalysisResult

NAVY = colors.HexColor("#1B3A6B")
RED = colors.HexColor("#DC2626")
AMBER = colors.HexColor("#D97706")
GREEN = colors.HexColor("#16A34A")
LIGHT_GRAY = colors.HexColor("#F3F4F6")


class ReportGenerator:
    def generate(self, results: List[AnalysisResult]) -> bytes:
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter,
                                leftMargin=0.75*inch, rightMargin=0.75*inch,
                                topMargin=0.75*inch, bottomMargin=0.75*inch)
        styles = getSampleStyleSheet()
        story = []

        # Header
        title_style = ParagraphStyle("title", fontSize=22, textColor=NAVY,
                                     alignment=TA_CENTER, spaceAfter=4, fontName="Helvetica-Bold")
        sub_style = ParagraphStyle("sub", fontSize=10, textColor=colors.gray,
                                   alignment=TA_CENTER, spaceAfter=16)

        story.append(Paragraph("FinExplain — Fraud Detection Report", title_style))
        story.append(Paragraph(f"Generated: {datetime.now().strftime('%B %d, %Y at %H:%M UTC')}", sub_style))
        story.append(HRFlowable(width="100%", thickness=2, color=NAVY))
        story.append(Spacer(1, 12))

        # Summary
        flagged = [r for r in results if r.is_anomaly]
        summary_data = [
            ["Total Transactions", "Flagged", "Clear", "High Risk"],
            [str(len(results)), str(len(flagged)),
             str(len(results) - len(flagged)),
             str(sum(1 for r in results if r.risk_level == "HIGH"))]
        ]
        summary_table = Table(summary_data, colWidths=[1.8*inch]*4)
        summary_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), NAVY),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 10),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [LIGHT_GRAY, colors.white]),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.lightgrey),
            ("TOPPADDING", (0, 0), (-1, -1), 8),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ]))
        story.append(summary_table)
        story.append(Spacer(1, 20))

        # Flagged transactions
        section_style = ParagraphStyle("section", fontSize=13, textColor=NAVY,
                                       fontName="Helvetica-Bold", spaceBefore=12, spaceAfter=6)
        body_style = ParagraphStyle("body", fontSize=9, leading=14, spaceAfter=4)
        label_style = ParagraphStyle("label", fontSize=8, textColor=colors.gray, spaceAfter=2)

        story.append(Paragraph("Flagged Transactions", section_style))
        story.append(HRFlowable(width="100%", thickness=1, color=colors.lightgrey))

        if not flagged:
            story.append(Paragraph("No transactions were flagged in this batch.", body_style))
        else:
            for i, result in enumerate(flagged, 1):
                txn = result.transaction
                risk_color = RED if result.risk_level == "HIGH" else AMBER

                story.append(Spacer(1, 8))
                story.append(Paragraph(
                    f'<font color="#{result.risk_level == "HIGH" and "DC2626" or "D97706"}">'
                    f'▲ Transaction #{i} — {result.risk_level} RISK</font>',
                    ParagraphStyle("risk", fontSize=11, fontName="Helvetica-Bold", spaceAfter=4)
                ))

                txn_data = [
                    ["Type", txn.type, "Amount", f"${txn.amount:,.2f}"],
                    ["Sender Balance (Before)", f"${txn.oldbalanceOrg:,.2f}",
                     "Sender Balance (After)", f"${txn.newbalanceOrig:,.2f}"],
                    ["Recipient Balance (Before)", f"${txn.oldbalanceDest:,.2f}",
                     "Recipient Balance (After)", f"${txn.newbalanceDest:,.2f}"],
                    ["Anomaly Score", f"{result.anomaly_score:.4f}", "LLM Provider", result.llm_provider or "N/A"],
                ]
                txn_table = Table(txn_data, colWidths=[1.8*inch, 1.8*inch, 1.8*inch, 1.8*inch])
                txn_table.setStyle(TableStyle([
                    ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
                    ("FONTNAME", (2, 0), (2, -1), "Helvetica-Bold"),
                    ("FONTSIZE", (0, 0), (-1, -1), 8),
                    ("BACKGROUND", (0, 0), (-1, -1), LIGHT_GRAY),
                    ("GRID", (0, 0), (-1, -1), 0.3, colors.lightgrey),
                    ("TOPPADDING", (0, 0), (-1, -1), 5),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                ]))
                story.append(txn_table)

                if result.explanation:
                    story.append(Spacer(1, 6))
                    story.append(Paragraph("AI Explanation:", label_style))
                    story.append(Paragraph(result.explanation, body_style))

                story.append(HRFlowable(width="100%", thickness=0.5, color=colors.lightgrey))

        # Footer
        story.append(Spacer(1, 20))
        footer_style = ParagraphStyle("footer", fontSize=8, textColor=colors.gray,
                                      alignment=TA_CENTER)
        story.append(Paragraph(
            "Generated by FinExplain · github.com/jemiridaniel/finexplain · For review purposes only.",
            footer_style
        ))

        doc.build(story)
        return buffer.getvalue()
