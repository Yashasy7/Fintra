export default function InvestigationPanel({ selectedAccount }) {
  return (
    <div style={panelStyle}>
      <h2 style={{ marginBottom: "10px" }}>Account Investigation</h2>

      {!selectedAccount ? (
        <p style={{ color: "#9aa4af" }}>
          Select a node to view account details.
        </p>
      ) : (
        <>
          <div style={fieldStyle}>
            <strong>ID:</strong> {selectedAccount.account_id}
          </div>

          <div style={fieldStyle}>
            <strong>Risk Score:</strong>{" "}
            <span style={{ color: getRiskColor(selectedAccount.suspicion_score) }}>
              {selectedAccount.suspicion_score}
            </span>
          </div>

          <div style={fieldStyle}>
            <strong>Detected Patterns:</strong>
            <ul style={{ marginTop: "6px" }}>
              {selectedAccount.detected_patterns.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          </div>

          <div style={fieldStyle}>
            <strong>Ring ID:</strong> {selectedAccount.ring_id}
          </div>
        </>
      )}
    </div>
  );
}

function getRiskColor(score) {
  if (score >= 90) return "#e63946";
  if (score >= 70) return "#ff9f1c";
  return "#4cc9f0";
}

const panelStyle = {
  background: "rgba(255,255,255,0.05)",
  padding: "14px",
  borderRadius: "10px",
  border: "1px solid rgba(255,255,255,0.08)",
  minHeight: "180px"
};

const fieldStyle = {
  marginBottom: "8px",
  fontSize: "13px"
};
