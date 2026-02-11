import { formatFull } from "@/lib/format";

export function CustomTooltip({
  active,
  payload,
  label,
  formatter,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
  formatter?: (v: number) => string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "1px solid #E5E0D8",
        borderRadius: 10,
        padding: "12px 16px",
        color: "#2D2A26",
        fontSize: 13,
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
      }}
    >
      <p style={{ margin: 0, fontWeight: 600, marginBottom: 6, color: "#2D2A26" }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ margin: "4px 0", color: p.color || "#AA5930", fontWeight: 500 }}>
          {p.name}: {formatter ? formatter(p.value) : formatFull(p.value) + " ₺"}
        </p>
      ))}
    </div>
  );
}
