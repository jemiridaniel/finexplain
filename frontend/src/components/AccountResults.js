import { useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  ReferenceDot, CartesianGrid,
} from "recharts";
import { BarChart, Bar, Cell } from "recharts";

const RISK_CONFIG = {
  HIGH:   { bg: "#FEF2F2", border: "#FCA5A5", badge: "#DC2626", icon: "🚨" },
  MEDIUM: { bg: "#FFFBEB", border: "#FCD34D", badge: "#D97706", icon: "⚠️" },
  LOW:    { bg: "#F0FDF4", border: "#86EFAC", badge: "#16A34A", icon: "✅" },
};

function ProfileCard({ data }) {
  const stats = [
    { label: "Transactions Analyzed", value: data.total_transactions },
    { label: "Period", value: `${data.period_days} days` },
    { label: "Avg Transaction", value: `$${data.mean_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
    { label: "Largest Transaction", value: `$${data.max_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
    { label: "Avg Transactions/Day", value: data.avg_daily_transactions.toFixed(1) },
    { label: "Typical Types", value: data.common_types.slice(0, 3).join(", ") },
  ];

  return (
    <div style={cardStyle}>
      <h3 style={sectionTitle}>📊 Account Behavior Profile — {data.account_id}</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        {stats.map((s) => (
          <div key={s.label} style={{ background: "#F9FAFB", borderRadius: 8, padding: "12px 14px" }}>
            <div style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 2 }}>{s.label}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#1B3A6B" }}>{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BalanceTimeline({ results }) {
  const chartData = results.map((r, i) => ({
    idx: i + 1,
    balance: r.transaction.newbalanceOrig,
    amount: r.transaction.amount,
    type: r.transaction.type,
    flagged: r.is_anomaly,
  }));

  const flaggedPoints = chartData.filter((d) => d.flagged);

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 8, padding: "10px 14px", fontSize: 12 }}>
        <div style={{ fontWeight: 700, marginBottom: 4 }}>Transaction #{d.idx}</div>
        <div>Type: {d.type}</div>
        <div>Amount: ${d.amount.toLocaleString()}</div>
        <div>Balance after: ${d.balance.toLocaleString()}</div>
        {d.flagged && <div style={{ color: "#DC2626", fontWeight: 600, marginTop: 4 }}>⚠ Flagged</div>}
      </div>
    );
  };

  return (
    <div style={cardStyle}>
      <h3 style={sectionTitle}>📈 Balance Timeline</h3>
      <p style={{ margin: "0 0 16px", fontSize: 12, color: "#9CA3AF" }}>
        Sender's closing balance after each transaction · Red dots = flagged
      </p>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={chartData} margin={{ left: 10, right: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
          <XAxis dataKey="idx" label={{ value: "Transaction #", position: "insideBottom", offset: -2, fontSize: 11 }} tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
          <Tooltip content={<CustomTooltip />} />
          <Line type="monotone" dataKey="balance" stroke="#1B3A6B" strokeWidth={2} dot={{ r: 3, fill: "#1B3A6B" }} />
          {flaggedPoints.map((p) => (
            <ReferenceDot key={p.idx} x={p.idx} y={p.balance} r={7} fill="#DC2626" stroke="#fff" strokeWidth={2} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function AnomalyCard({ result, index }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = RISK_CONFIG[result.risk_level] || RISK_CONFIG.LOW;
  const t = result.transaction;

  const chartData = result.shap_values.slice(0, 5).map((s) => ({
    name: s.feature.replace(" Balance", " Bal."),
    value: Math.abs(s.shap_value),
    direction: s.direction,
  }));

  return (
    <div style={{ border: `1px solid ${cfg.border}`, borderRadius: 12, background: cfg.bg, overflow: "hidden" }}>
      {/* Header row */}
      <div
        onClick={() => setExpanded((x) => !x)}
        style={{ padding: "14px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}
      >
        <span style={{ fontSize: 20 }}>{cfg.icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: "#1B3A6B" }}>
              #{index + 1} — {t.type} of ${t.amount.toLocaleString()}
            </span>
            <span style={{ fontSize: 11, background: cfg.badge, color: "#fff", padding: "2px 8px", borderRadius: 20, fontWeight: 600 }}>
              {result.risk_level}
            </span>
            {result.behavioral_anomaly && (
              <span style={{ fontSize: 11, background: "#7C3AED", color: "#fff", padding: "2px 8px", borderRadius: 20, fontWeight: 600 }}>
                Behavioral
              </span>
            )}
          </div>
          <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>
            Fraud probability: {(Math.abs(result.anomaly_score) * 100).toFixed(1)}%
            {result.behavioral_risk > 0 && ` · Behavioral risk: ${(result.behavioral_risk * 100).toFixed(0)}%`}
          </div>
        </div>
        <span style={{ fontSize: 12, color: "#9CA3AF" }}>{expanded ? "▲" : "▼"}</span>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div style={{ padding: "0 18px 18px", borderTop: "1px solid rgba(0,0,0,0.06)" }}>
          {/* Behavioral flags */}
          {result.behavioral_flags?.length > 0 && (
            <div style={{ background: "#F5F3FF", borderRadius: 8, padding: "10px 14px", margin: "12px 0" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#7C3AED", marginBottom: 6 }}>
                🔍 Behavioral Anomaly Signals
              </div>
              {result.behavioral_flags.map((flag, i) => (
                <div key={i} style={{ fontSize: 12, color: "#374151", marginBottom: 3 }}>• {flag}</div>
              ))}
            </div>
          )}

          {/* LLM explanation */}
          {result.explanation && (
            <div style={{ background: "#fff", borderRadius: 8, padding: "10px 14px", margin: "12px 0", border: "1px solid #E5E7EB" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#1B3A6B" }}>🤖 AI Explanation</span>
                {result.llm_provider && (
                  <span style={{ fontSize: 11, background: "#EEF2FF", color: "#4338CA", padding: "2px 8px", borderRadius: 20 }}>
                    via {result.llm_provider}
                  </span>
                )}
              </div>
              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.65, color: "#374151" }}>{result.explanation}</p>
            </div>
          )}

          {/* SHAP bar chart */}
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 8 }}>
              🔬 Top Feature Contributions (SHAP)
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={chartData} layout="vertical" margin={{ left: 10 }}>
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis dataKey="name" type="category" width={160} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v) => v.toFixed(4)} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.direction === "increases_risk" ? "#DC2626" : "#16A34A"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AccountResults({ data }) {
  const flagged = data.results.filter((r) => r.is_anomaly);
  const allClear = flagged.length === 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Profile */}
      <ProfileCard data={data} />

      {/* Balance timeline */}
      <BalanceTimeline results={data.results} />

      {/* Overall risk summary */}
      <div style={{
        ...cardStyle,
        background: allClear ? "#F0FDF4" : "#FEF2F2",
        border: `1px solid ${allClear ? "#86EFAC" : "#FCA5A5"}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <span style={{ fontSize: 24 }}>{allClear ? "✅" : "🚨"}</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: allClear ? "#16A34A" : "#DC2626" }}>
              {allClear
                ? "No suspicious activity detected"
                : `${flagged.length} suspicious transaction${flagged.length > 1 ? "s" : ""} detected`}
            </div>
            <div style={{ fontSize: 12, color: "#6B7280" }}>
              {data.total_transactions} transactions analyzed · {data.period_days}-day window
            </div>
          </div>
        </div>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, color: "#374151" }}>{data.narrative}</p>
      </div>

      {/* Flagged transactions */}
      {flagged.length > 0 && (
        <div style={cardStyle}>
          <h3 style={{ ...sectionTitle, marginBottom: 12 }}>
            Flagged Transactions ({flagged.length})
          </h3>
          <p style={{ margin: "0 0 14px", fontSize: 12, color: "#9CA3AF" }}>
            Click any transaction to expand SHAP values, behavioral signals, and AI explanation.
            <strong style={{ color: "#7C3AED" }}> Purple = flagged by behavioral baseline only</strong> (normal globally, unusual for this account).
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {flagged.map((r, i) => (
              <AnomalyCard key={i} result={r} index={i} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const cardStyle = {
  background: "#fff", borderRadius: 14, padding: 24,
  boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
};
const sectionTitle = {
  margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: "#1B3A6B",
};
