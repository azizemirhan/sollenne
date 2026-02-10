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
        background: "#1e1e2e",
        borderRadius: 12,
        padding: "20px",
        flex: fullWidth ? "1 1 100%" : "1 1 calc(50% - 8px)",
        minWidth: 320,
        overflow: "hidden",
      }}
    >
      <h3
        style={{
          margin: "0 0 16px 0",
          fontSize: 16,
          fontWeight: 600,
          color: "#e0e0e0",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span
          style={{
            width: 4,
            height: 20,
            background: "#00f5d4",
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
