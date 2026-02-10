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
        background: "#1e1e2e",
        border: "1px solid #333",
        borderRadius: 8,
        padding: "10px 14px",
        color: "#e0e0e0",
        fontSize: 13,
      }}
    >
      <p style={{ margin: 0, fontWeight: 600, marginBottom: 4, color: "#ccc" }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ margin: 0, color: p.color || "#00f5d4" }}>
          {p.name}: {formatter ? formatter(p.value) : formatFull(p.value) + " ₺"}
        </p>
      ))}
    </div>
  );
}
