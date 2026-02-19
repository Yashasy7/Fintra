export default function RingTable({ analysisData }) {
  if (!analysisData || !analysisData.fraud_rings?.length) {
    return (
      <div style={panelStyle}>
        <h2>Fraud Rings</h2>
        <p style={{ color: "#9aa4af" }}>No rings detected</p>
      </div>
    );
  }

  return (
    <div style={panelStyle}>
      <h2 style={{ marginBottom: "10px" }}>Fraud Rings</h2>

      <table style={tableStyle}>
        <thead>
          <tr>
            <th>Ring ID</th>
            <th>Members</th>
            <th>Risk</th>
          </tr>
        </thead>
        <tbody>
          {analysisData.fraud_rings.map(ring => (
            <tr key={ring.ring_id}>
              <td>{ring.ring_id}</td>
              <td>{ring.member_accounts.join(", ")}</td>
              <td style={{ color: "#e63946", fontWeight: "600" }}>
                {ring.risk_score}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const panelStyle = {
  background: "rgba(255,255,255,0.05)",
  padding: "14px",
  borderRadius: "10px",
  border: "1px solid rgba(255,255,255,0.08)"
};

const tableStyle = {
  width: "100%",
  fontSize: "13px",
  borderCollapse: "collapse"
};
