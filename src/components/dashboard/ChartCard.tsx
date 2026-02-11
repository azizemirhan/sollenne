export function ChartCard({
  title,
  children,
  fullWidth,
}: {
  title: string;
  children: React.ReactNode;
  fullWidth?: boolean;
}) {
  return (
    <div
      style={{
        background: "#FFFFFF",
        borderRadius: 16,
        padding: "24px",
        flex: fullWidth ? "1 1 100%" : "1 1 calc(50% - 8px)",
        minWidth: 320,
        overflow: "hidden",
        border: "1px solid #E5E0D8",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      }}
    >
      <h3
        style={{
          margin: "0 0 20px 0",
          fontSize: 16,
          fontWeight: 700,
          color: "#2D2A26",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <span
          style={{
            width: 4,
            height: 22,
            background: "#AA5930",
            borderRadius: 2,
            display: "inline-block",
          }}
        />
        {title}
      </h3>
      {children}
    </div>
  );
}
