import { useState } from "react";
import TransactionForm from "./components/TransactionForm";
import BulkUpload from "./components/BulkUpload";
import AccountHistory from "./components/AccountHistory";
import ResultCard from "./components/ResultCard";
import BulkResults from "./components/BulkResults";
import AccountResults from "./components/AccountResults";
import Header from "./components/Header";

const TABS = [
  { id: "single",  label: "Single Transaction" },
  { id: "bulk",    label: "Bulk CSV Upload" },
  { id: "account", label: "Account History" },
];

export default function App() {
  const [mode, setMode] = useState("single");
  const [singleResult, setSingleResult] = useState(null);
  const [bulkResult, setBulkResult] = useState(null);
  const [accountResult, setAccountResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const switchMode = (m) => {
    setMode(m);
    setSingleResult(null);
    setBulkResult(null);
    setAccountResult(null);
    setError(null);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F0F4FF", fontFamily: "Inter, system-ui, sans-serif" }}>
      <Header />

      <main style={{ maxWidth: 900, margin: "0 auto", padding: "32px 16px" }}>
        {/* Mode Toggle */}
        <div style={{
          display: "flex", gap: 4, marginBottom: 28, background: "#fff",
          borderRadius: 12, padding: 6, boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
          width: "fit-content",
        }}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => switchMode(tab.id)}
              style={{
                padding: "8px 20px", borderRadius: 8, border: "none", cursor: "pointer",
                fontWeight: 600, fontSize: 14, transition: "all 0.2s",
                background: mode === tab.id ? "#1B3A6B" : "transparent",
                color: mode === tab.id ? "#fff" : "#6B7280",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {error && (
          <div style={{
            background: "#FEE2E2", border: "1px solid #FCA5A5", borderRadius: 10,
            padding: "12px 16px", marginBottom: 20, color: "#991B1B", fontSize: 14,
          }}>
            {error}
          </div>
        )}

        {mode === "single" && (
          <>
            <TransactionForm
              onResult={(r) => { setSingleResult(r); setError(null); }}
              onError={setError}
              loading={loading}
              setLoading={setLoading}
            />
            {singleResult && <ResultCard result={singleResult} />}
          </>
        )}

        {mode === "bulk" && (
          <>
            <BulkUpload
              onResult={(r) => { setBulkResult(r); setError(null); }}
              onError={setError}
              loading={loading}
              setLoading={setLoading}
            />
            {bulkResult && <BulkResults data={bulkResult} />}
          </>
        )}

        {mode === "account" && (
          <>
            <AccountHistory
              onResult={(r) => { setAccountResult(r); setError(null); }}
              onError={setError}
              loading={loading}
              setLoading={setLoading}
            />
            {accountResult && <AccountResults data={accountResult} />}
          </>
        )}
      </main>

      <footer style={{ textAlign: "center", padding: "24px 0", color: "#9CA3AF", fontSize: 13 }}>
        FinExplain · Built by{" "}
        <a href="https://github.com/jemiridaniel" style={{ color: "#1B3A6B" }}>
          Jemiri Daniel
        </a>{" "}
        · Powered by Gradient Boosting + SHAP + LLM
      </footer>
    </div>
  );
}
