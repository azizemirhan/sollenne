export function KPICard({
  icon,
  label,
  value,
  sub,
  changePct,
}: {
  icon: string;
  label: string;
  value: string | number;
  sub?: string;
  changePct?: number | null;
}) {
  return (
    <div
      style={{
        background: "#1e1e2e",
        borderRadius: 12,
        padding: "20px 16px",
        flex: "1 1 150px",
        minWidth: 150,
      }}
    >
      <div style={{ fontSize: 28, marginBottom: 4 }}>{icon}</div>
      <div
        style={{
          fontSize: 11,
          color: "#888",
          fontWeight: 600,
          letterSpacing: 1,
          textTransform: "uppercase",
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
        <div style={{ fontSize: 26, fontWeight: 700, color: "#00f5d4", lineHeight: 1.2 }}>
          {value}
        </div>
        {changePct != null && (
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: changePct > 0 ? "#ef476f" : changePct < 0 ? "#06d6a0" : "#888",
            }}
          >
            {changePct > 0 ? "+" : ""}
            {changePct.toFixed(1)}%
          </span>
        )}
      </div>
      {sub && <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}
