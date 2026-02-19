export default function SummaryPanel({ analysisData }) {
  if (!analysisData || !analysisData.summary) return null;

  const {
    total_accounts_analyzed,
    suspicious_accounts_flagged,
    fraud_rings_detected,
    processing_time_seconds
  } = analysisData.summary;

  return (
    <div style={panelStyle}>
      <h2 style={{ marginBottom: "10px" }}>Investigation Summary</h2>

      <div style={gridStyle}>
        <MetricBox label="Total Accounts" value={total_accounts_analyzed} />
        <MetricBox label="Suspicious Accounts" value={suspicious_accounts_flagged} />
        <MetricBox label="Fraud Rings" value={fraud_rings_detected} />
        <MetricBox label="Processing Time (s)" value={processing_time_seconds} />
      </div>
    </div>
  );
}

function MetricBox({ label, value }) {
  return (
    <div style={boxStyle}>
      <div style={{ fontSize: "13px", color: "#9aa4af" }}>{label}</div>
      <div style={metricValueStyle}>{value}</div>
    </div>
  );
}

const panelStyle = {
  background: "rgba(255,255,255,0.05)",
  backdropFilter: "blur(8px)",
  padding: "14px",
  borderRadius: "10px",
  border: "1px solid rgba(255,255,255,0.08)"
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
  gap: "12px"
};

const boxStyle = {
  background: "rgba(0,0,0,0.35)",
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid rgba(255,255,255,0.06)"
};

const metricValueStyle = {
  fontSize: "22px",
  fontWeight: "600",
  marginTop: "6px",
  color: "#4cc9f0"
};
