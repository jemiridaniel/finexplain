import { useRef } from "react";
import { analyzeBulk } from "../services/api";

export default function BulkUpload({ onResult, onError, loading, setLoading }) {
  const inputRef = useRef();

  const handleFile = async (file) => {
    if (!file) return;
    setLoading(true);
    try {
      const res = await analyzeBulk(file);
      onResult(res.data);
    } catch (e) {
      onError(e.response?.data?.detail || "Failed to process CSV.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: "#fff", borderRadius: 14, padding: 32, boxShadow: "0 2px 12px rgba(0,0,0,0.07)", marginBottom: 24 }}>
      <h2 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 700, color: "#1B3A6B" }}>Upload CSV</h2>
      <p style={{ margin: "0 0 20px", fontSize: 13, color: "#6B7280" }}>
        Required columns: <code>type, amount, oldbalanceOrg, newbalanceOrig, oldbalanceDest, newbalanceDest</code>
        <br />Max 50 rows per upload. Download a{" "}
        <a href="/sample_transactions.csv" style={{ color: "#1B3A6B" }}>sample CSV</a>.
      </p>

      <div
        onClick={() => inputRef.current.click()}
        style={{
          border: "2px dashed #D1D5DB", borderRadius: 12, padding: "40px 0",
          textAlign: "center", cursor: "pointer", transition: "border-color 0.2s",
          background: "#FAFAFA"
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
      >
        <div style={{ fontSize: 36, marginBottom: 8 }}>📁</div>
        <div style={{ fontWeight: 600, color: "#374151" }}>Drop your CSV here or click to browse</div>
        <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 4 }}>PaySim format supported</div>
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          style={{ display: "none" }}
          onChange={(e) => handleFile(e.target.files[0])}
        />
      </div>

      {loading && (
        <div style={{ textAlign: "center", marginTop: 20, color: "#1B3A6B", fontWeight: 600 }}>
          Analyzing transactions...
        </div>
      )}
    </div>
  );
}
