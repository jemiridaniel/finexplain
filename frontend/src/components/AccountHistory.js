import { useState, useRef } from "react";
import { analyzeAccountHistory } from "../services/api";

// A realistic 2-week history: normal small payments → then account gets drained
const DEMO_HISTORY = [
  { type: "PAYMENT",  amount: 45.00,     oldbalanceOrg: 12500.00, newbalanceOrig: 12455.00, oldbalanceDest: 200.00,   newbalanceDest: 245.00   },
  { type: "PAYMENT",  amount: 120.50,    oldbalanceOrg: 12455.00, newbalanceOrig: 12334.50, oldbalanceDest: 500.00,   newbalanceDest: 620.50   },
  { type: "CASH_OUT", amount: 200.00,    oldbalanceOrg: 12334.50, newbalanceOrig: 12134.50, oldbalanceDest: 1000.00,  newbalanceDest: 1200.00  },
  { type: "PAYMENT",  amount: 75.50,     oldbalanceOrg: 12134.50, newbalanceOrig: 12059.00, oldbalanceDest: 300.00,   newbalanceDest: 375.50   },
  { type: "CASH_IN",  amount: 3000.00,   oldbalanceOrg: 12059.00, newbalanceOrig: 15059.00, oldbalanceDest: 0.00,     newbalanceDest: 0.00     },
  { type: "PAYMENT",  amount: 55.00,     oldbalanceOrg: 15059.00, newbalanceOrig: 15004.00, oldbalanceDest: 150.00,   newbalanceDest: 205.00   },
  { type: "PAYMENT",  amount: 90.00,     oldbalanceOrg: 15004.00, newbalanceOrig: 14914.00, oldbalanceDest: 400.00,   newbalanceDest: 490.00   },
  { type: "CASH_OUT", amount: 180.00,    oldbalanceOrg: 14914.00, newbalanceOrig: 14734.00, oldbalanceDest: 2000.00,  newbalanceDest: 2180.00  },
  { type: "PAYMENT",  amount: 60.00,     oldbalanceOrg: 14734.00, newbalanceOrig: 14674.00, oldbalanceDest: 100.00,   newbalanceDest: 160.00   },
  // Suspicious: entire balance transferred out in one go
  { type: "TRANSFER", amount: 14674.00,  oldbalanceOrg: 14674.00, newbalanceOrig: 0.00,     oldbalanceDest: 0.00,     newbalanceDest: 14674.00 },
];

const CSV_COLS = ["type", "amount", "oldbalanceOrg", "newbalanceOrig", "oldbalanceDest", "newbalanceDest"];

function parseCSV(text) {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return null;

  const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
  const missing = CSV_COLS.filter((c) => !headers.includes(c));
  if (missing.length) return { error: `Missing columns: ${missing.join(", ")}` };

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const vals = lines[i].split(",").map((v) => v.trim().replace(/"/g, ""));
    const row = {};
    headers.forEach((h, idx) => { row[h] = vals[idx]; });
    rows.push({
      type: row.type,
      amount: parseFloat(row.amount),
      oldbalanceOrg: parseFloat(row.oldbalanceOrg),
      newbalanceOrig: parseFloat(row.newbalanceOrig),
      oldbalanceDest: parseFloat(row.oldbalanceDest),
      newbalanceDest: parseFloat(row.newbalanceDest),
      nameOrig: row.nameOrig || undefined,
      nameDest: row.nameDest || undefined,
    });
  }
  return { rows };
}

export default function AccountHistory({ onResult, onError, loading, setLoading }) {
  const [accountId, setAccountId] = useState("C_123456789");
  const [fileName, setFileName] = useState(null);
  const inputRef = useRef();

  const run = async (transactions) => {
    onError(null);
    setLoading(true);
    try {
      const res = await analyzeAccountHistory(accountId || "C_account_001", transactions);
      onResult(res.data);
    } catch (e) {
      onError(e.response?.data?.detail || "Account history analysis failed. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const handleFile = (file) => {
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = parseCSV(e.target.result);
      if (!result) { onError("Could not parse CSV — file appears empty."); return; }
      if (result.error) { onError(result.error); return; }
      run(result.rows);
    };
    reader.readAsText(file);
  };

  return (
    <div style={cardStyle}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 700, color: "#1B3A6B" }}>
          Account History Analysis
        </h2>
        <p style={{ margin: 0, fontSize: 13, color: "#6B7280" }}>
          Upload 2 weeks of transactions for one account. FinExplain builds a behavioral
          baseline and flags anything that deviates from <em>this account's own patterns</em> —
          not just global thresholds.
        </p>
      </div>

      {/* Account ID */}
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Account ID (optional)</label>
        <input
          type="text"
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
          placeholder="e.g. C_123456789"
          style={inputStyle}
        />
      </div>

      {/* Drop zone */}
      <div
        onClick={() => inputRef.current.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
        style={dropStyle}
      >
        <div style={{ fontSize: 32, marginBottom: 6 }}>📂</div>
        <div style={{ fontWeight: 600, color: "#374151", fontSize: 14 }}>
          {fileName ? fileName : "Drop CSV here or click to browse"}
        </div>
        <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 4 }}>
          Required columns: <code>type, amount, oldbalanceOrg, newbalanceOrig, oldbalanceDest, newbalanceDest</code>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          style={{ display: "none" }}
          onChange={(e) => handleFile(e.target.files[0])}
        />
      </div>

      {/* Divider */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "16px 0" }}>
        <div style={{ flex: 1, height: 1, background: "#E5E7EB" }} />
        <span style={{ fontSize: 12, color: "#9CA3AF" }}>or</span>
        <div style={{ flex: 1, height: 1, background: "#E5E7EB" }} />
      </div>

      {/* Demo button */}
      <button
        onClick={() => run(DEMO_HISTORY)}
        disabled={loading}
        style={demoButtonStyle}
      >
        🎯 Run Demo: 10-Transaction History (includes suspicious drain)
      </button>

      {loading && (
        <div style={{ textAlign: "center", marginTop: 20, color: "#1B3A6B", fontWeight: 600, fontSize: 14 }}>
          Analyzing account history...
        </div>
      )}
    </div>
  );
}

const cardStyle = {
  background: "#fff", borderRadius: 14, padding: 24,
  boxShadow: "0 2px 12px rgba(0,0,0,0.07)", marginBottom: 24,
};
const labelStyle = { fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 };
const inputStyle = {
  padding: "9px 12px", borderRadius: 8, border: "1px solid #D1D5DB",
  fontSize: 14, width: "100%", outline: "none", boxSizing: "border-box",
};
const dropStyle = {
  border: "2px dashed #D1D5DB", borderRadius: 12, padding: "32px 0",
  textAlign: "center", cursor: "pointer", background: "#FAFAFA",
};
const demoButtonStyle = {
  width: "100%", padding: "12px 0", borderRadius: 8, border: "1px solid #1B3A6B",
  background: "#EEF2FF", color: "#1B3A6B", fontWeight: 700, fontSize: 14,
  cursor: "pointer",
};
