import { downloadReport } from "../services/api";
import ResultCard from "./ResultCard";

export default function BulkResults({ data }) {
  const handleDownload = async () => {
    try {
      const res = await downloadReport(data.results);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = "finexplain_report.pdf";
      a.click();
    } catch (e) {
      alert("Failed to generate report.");
    }
  };

  const flagged = data.results.filter((r) => r.is_anomaly);

  return (
    <div>
      {/* Summary bar */}
      <div style={{
        background: "#1B3A6B", borderRadius: 14, padding: "20px 28px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 24, color: "#fff"
      }}>
        <div style={{ display: "flex", gap: 36 }}>
          {[
            { label: "Total", value: data.total },
            { label: "Flagged", value: data.flagged, color: "#FCA5A5" },
            { label: "Clear", value: data.total - data.flagged, color: "#86EFAC" },
          ].map(({ label, value, color }) => (
            <div key={label}>
              <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 2 }}>{label}</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: color || "#fff" }}>{value}</div>
            </div>
          ))}
        </div>
        <button
          onClick={handleDownload}
          style={{
            padding: "10px 20px", background: "#fff", color: "#1B3A6B",
            border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 14
          }}
        >
          📄 Download PDF Report
        </button>
      </div>

      {/* Flagged transactions */}
      {flagged.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40, color: "#16A34A", fontWeight: 600, fontSize: 16 }}>
          ✅ No anomalies detected in this batch.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          {flagged.map((result, i) => (
            <div key={i}>
              <div style={{ fontWeight: 700, color: "#6B7280", fontSize: 13, marginBottom: 10 }}>
                Transaction {i + 1} of {flagged.length} flagged
              </div>
              <ResultCard result={result} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
