import React from "react";

function InvestigationPanel({ account }) {
  if (!account)
    return (
      <div className="card">
        <h3>Account Investigation</h3>
        <p>Select a node to investigate.</p>
      </div>
    );

  return (
    <div className="card">
      <h3>Account Investigation</h3>
      <p><strong>ID:</strong> {account.account_id}</p>

      {account.suspicion_score !== null && account.suspicion_score !== undefined ? (
        <>
          <p><strong>Risk Score:</strong> {account.suspicion_score}</p>
          <div className="risk-bar">
            <div
              className="risk-fill"
              style={{ width: `${account.suspicion_score}%` }}
            />
          </div>
        </>
      ) : (
        <p style={{ color: '#4cc9f0' }}><strong>No risk detected</strong></p>
      )}

      <p><strong>Patterns:</strong></p>
      <ul>
        {account.detected_patterns && account.detected_patterns.length > 0 ? (
          account.detected_patterns.map((p, i) => (
            <li key={i}>{p}</li>
          ))
        ) : (
          <li style={{ color: '#9aa4af' }}>None</li>
        )}
      </ul>

      <p><strong>Ring:</strong> {account.ring_id ?? 'None'}</p>
      {account.is_legit && <p style={{ color: '#00f5c4', marginTop: 8 }}>Legitimate account</p>}
    </div>
  );
}

export default InvestigationPanel;
