import { useState } from "react";
import { analyzeTransaction } from "../services/api";

const TYPES = ["TRANSFER", "CASH_OUT", "CASH_IN", "PAYMENT", "DEBIT"];

const defaultForm = {
  type: "TRANSFER",
  amount: "",
  oldbalanceOrg: "",
  newbalanceOrig: "",
  oldbalanceDest: "",
  newbalanceDest: "",
};

// Suspicious preset for demo
const DEMO_SUSPICIOUS = {
  type: "TRANSFER",
  amount: 9000.60,
  oldbalanceOrg: 9000.60,
  newbalanceOrig: 0,
  oldbalanceDest: 0,
  newbalanceDest: 0,
};

const DEMO_NORMAL = {
  type: "PAYMENT",
  amount: 120.50,
  oldbalanceOrg: 5000,
  newbalanceOrig: 4879.50,
  oldbalanceDest: 2000,
  newbalanceDest: 2120.50,
};

export default function TransactionForm({ onResult, onError, loading, setLoading }) {
  const [form, setForm] = useState(defaultForm);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
  const payload = {
    type: form.type,
    amount: parseFloat(form.amount),
    oldbalanceOrg: parseFloat(form.oldbalanceOrg),
    newbalanceOrig: parseFloat(form.newbalanceOrig),
    oldbalanceDest: parseFloat(form.oldbalanceDest),
    newbalanceDest: parseFloat(form.newbalanceDest),
  };

  const numericFields = ["amount", "oldbalanceOrg", "newbalanceOrig", "oldbalanceDest", "newbalanceDest"];
  const hasInvalid = numericFields.some((k) => {
    const raw = form[k];
    return raw === "" || raw === undefined || raw === null || isNaN(parseFloat(raw));
  });

  if (hasInvalid) {
    onError("Please fill in all fields with valid numbers.");
    return;
  }

  onError(null); 
  setLoading(true);
  try {
    const res = await analyzeTransaction(payload);
    onResult(res.data);
  } catch (e) {
    onError(e.response?.data?.detail || "Analysis failed. Is the backend running on port 8000?");
  } finally {
    setLoading(false);
  }
};

  const field = (label, key, placeholder) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>{label}</label>
      <input
        type="number"
        value={form[key]}
        onChange={(e) => set(key, e.target.value)}
        placeholder={placeholder}
        style={inputStyle}
      />
    </div>
  );

  return (
    <div style={cardStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "#1B3A6B", margin: 0 }}>Transaction Details</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setForm(DEMO_SUSPICIOUS)} style={demoBtn("#FEF2F2", "#DC2626")}>
            Try Suspicious
          </button>
          <button onClick={() => setForm(DEMO_NORMAL)} style={demoBtn("#F0FDF4", "#16A34A")}>
            Try Normal
          </button>
        </div>
      </div>

      {/* Type */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>
          Transaction Type
        </label>
        <select value={form.type} onChange={(e) => set("type", e.target.value)} style={inputStyle}>
          {TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
        {field("Amount ($)", "amount", "e.g. 9000.60")}
        {field("Sender Balance (Before)", "oldbalanceOrg", "e.g. 9000.60")}
        {field("Sender Balance (After)", "newbalanceOrig", "e.g. 0.00")}
        {field("Recipient Balance (Before)", "oldbalanceDest", "e.g. 0.00")}
        {field("Recipient Balance (After)", "newbalanceDest", "e.g. 9000.60")}
      </div>

      <button
        onClick={submit}
        disabled={loading}
        style={{
          width: "100%", padding: "12px 0", borderRadius: 8, border: "none",
          background: loading ? "#93C5FD" : "#1B3A6B",
          color: "#fff", fontWeight: 700, fontSize: 15, cursor: loading ? "not-allowed" : "pointer",
          transition: "background 0.2s"
        }}
      >
        {loading ? "Analyzing..." : "Analyze Transaction"}
      </button>
    </div>
  );
}

const cardStyle = {
  background: "#fff", borderRadius: 14, padding: 24,
  boxShadow: "0 2px 12px rgba(0,0,0,0.07)", marginBottom: 24
};

const inputStyle = {
  padding: "9px 12px", borderRadius: 8, border: "1px solid #D1D5DB",
  fontSize: 14, width: "100%", outline: "none", boxSizing: "border-box"
};

const demoBtn = (bg, color) => ({
  padding: "5px 12px", borderRadius: 6, border: `1px solid ${color}`,
  background: bg, color, fontSize: 12, fontWeight: 600, cursor: "pointer"
});
