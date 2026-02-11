import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KPICardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  changePct?: number | null;
}

export function KPICard({ icon, label, value, sub, changePct }: KPICardProps) {
  const getChangeIcon = () => {
    if (changePct == null) return null;
    if (changePct > 0) return <TrendingUp size={14} />;
    if (changePct < 0) return <TrendingDown size={14} />;
    return <Minus size={14} />;
  };

  return (
    <div
      style={{
        background: "#FFFFFF",
        borderRadius: 16,
        padding: "24px 20px",
        flex: "1 1 160px",
        minWidth: 160,
        border: "1px solid #E5E0D8",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        transition: "transform 0.2s, box-shadow 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)";
      }}
    >
      <div style={{ fontSize: 28, marginBottom: 8, color: "#AA5930" }}>{icon}</div>
      <div
        style={{
          fontSize: 12,
          color: "#9B9590",
          fontWeight: 600,
          letterSpacing: 0.5,
          textTransform: "uppercase",
          marginBottom: 10,
        }}
      >
        {label}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
        <div style={{ fontSize: 28, fontWeight: 700, color: "#AA5930", lineHeight: 1.2 }}>
          {value}
        </div>
        {changePct != null && (
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: changePct > 0 ? "#B54242" : changePct < 0 ? "#4A7C59" : "#9B9590",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            {getChangeIcon()}
            {Math.abs(changePct).toFixed(1)}%
          </span>
        )}
      </div>
      {sub && <div style={{ fontSize: 13, color: "#9B9590", marginTop: 6 }}>{sub}</div>}
    </div>
  );
}
