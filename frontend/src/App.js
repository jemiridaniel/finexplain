import { useState } from "react";
import TransactionForm from "./components/TransactionForm";
import BulkUpload from "./components/BulkUpload";
import ResultCard from "./components/ResultCard";
import BulkResults from "./components/BulkResults";
import Header from "./components/Header";

export default function App() {
  const [mode, setMode] = useState("single"); // "single" | "bulk"
  const [singleResult, setSingleResult] = useState(null);
  const [bulkResult, setBulkResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  return (
    <div style={{ minHeight: "100vh", background: "#F0F4FF", fontFamily: "Inter, system-ui, sans-serif" }}>
      <Header />

      <main style={{ maxWidth: 900, margin: "0 auto", padding: "32px 16px" }}>
        {/* Mode Toggle */}
        <div style={{ display: "flex", gap: 8, marginBottom: 28, background: "#fff", borderRadius: 12, padding: 6, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", width: "fit-content" }}>
          {["single", "bulk"].map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setSingleResult(null); setBulkResult(null); setError(null); }}
              style={{
                padding: "8px 24px", borderRadius: 8, border: "none", cursor: "pointer",
                fontWeight: 600, fontSize: 14, transition: "all 0.2s",
                background: mode === m ? "#1B3A6B" : "transparent",
                color: mode === m ? "#fff" : "#6B7280",
              }}
            >
              {m === "single" ? "Single Transaction" : "Bulk CSV Upload"}
            </button>
          ))}
        </div>

        {error && (
          <div style={{ background: "#FEE2E2", border: "1px solid #FCA5A5", borderRadius: 10, padding: "12px 16px", marginBottom: 20, color: "#991B1B", fontSize: 14 }}>
            {error}
          </div>
        )}

        {mode === "single" ? (
          <>
            <TransactionForm
              onResult={(r) => { setSingleResult(r); setError(null); }}
              onError={setError}
              loading={loading}
              setLoading={setLoading}
            />
            {singleResult && <ResultCard result={singleResult} />}
          </>
        ) : (
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
