export default function Header() {
  return (
    <header style={{
      background: "#1B3A6B",
      color: "#fff",
      padding: "0 24px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      height: 64,
      boxShadow: "0 2px 12px rgba(0,0,0,0.15)"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 24 }}>🔍</span>
        <div>
          <div style={{ fontWeight: 800, fontSize: 18, letterSpacing: "-0.3px" }}>FinExplain</div>
          <div style={{ fontSize: 11, opacity: 0.7, letterSpacing: "0.5px" }}>EXPLAINABLE FRAUD DETECTION</div>
        </div>
      </div>
      <a
        href="https://github.com/jemiridaniel/finexplain"
        target="_blank"
        rel="noreferrer"
        style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}
      >
        ⭐ GitHub
      </a>
    </header>
  );
}
