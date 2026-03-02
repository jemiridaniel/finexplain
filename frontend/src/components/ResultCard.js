import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const RISK_CONFIG = {
  HIGH:   { bg: "#FEF2F2", border: "#FCA5A5", badge: "#DC2626", icon: "🚨" },
  MEDIUM: { bg: "#FFFBEB", border: "#FCD34D", badge: "#D97706", icon: "⚠️" },
  LOW:    { bg: "#F0FDF4", border: "#86EFAC", badge: "#16A34A", icon: "✅" },
};

export default function ResultCard({ result }) {
  const cfg = RISK_CONFIG[result.risk_level] || RISK_CONFIG.LOW;

  const chartData = result.shap_values.slice(0, 6).map((s) => ({
    name: s.feature.replace(" Balance", " Bal."),
    value: Math.abs(s.shap_value),
    direction: s.direction,
  }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Risk banner */}
      <div style={{
        background: cfg.bg, border: `1px solid ${cfg.border}`,
        borderRadius: 14, padding: "20px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
        <div>
          <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 2 }}>Risk Assessment</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 28 }}>{cfg.icon}</span>
            <span style={{ fontSize: 26, fontWeight: 800, color: cfg.badge }}>
              {result.risk_level} RISK
            </span>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 12, color: "#6B7280" }}>Fraud Probability</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#1B3A6B" }}>
            {(Math.abs(result.anomaly_score) * 100).toFixed(1)}%
          </div>
          <div style={{ fontSize: 11, color: "#9CA3AF" }}>model confidence</div>
        </div>
      </div>

      {/* Explanation */}
      {result.explanation && (
        <div style={{ background: "#fff", borderRadius: 14, padding: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#1B3A6B" }}>
              🤖 AI Explanation
            </h3>
            <span style={{ fontSize: 11, background: "#EEF2FF", color: "#4338CA", padding: "2px 8px", borderRadius: 20 }}>
              via {result.llm_provider}
            </span>
          </div>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, color: "#374151" }}>
            {result.explanation}
          </p>
        </div>
      )}

      {/* SHAP chart */}
      <div style={{ background: "#fff", borderRadius: 14, padding: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <h3 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700, color: "#1B3A6B" }}>
          🔬 Feature Impact (SHAP Values)
        </h3>
        <p style={{ margin: "0 0 16px", fontSize: 12, color: "#9CA3AF" }}>
          Which features contributed most to this decision
        </p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 11 }} />
            <Tooltip
              formatter={(v, n, p) => [v.toFixed(4), p.payload.direction === "increases_risk" ? "↑ Increases Risk" : "↓ Decreases Risk"]}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.direction === "increases_risk" ? "#DC2626" : "#16A34A"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#6B7280" }}>
            <div style={{ width: 12, height: 12, background: "#DC2626", borderRadius: 2 }} /> Increases risk
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#6B7280" }}>
            <div style={{ width: 12, height: 12, background: "#16A34A", borderRadius: 2 }} /> Decreases risk
          </div>
        </div>
      </div>
    </div>
  );
}
