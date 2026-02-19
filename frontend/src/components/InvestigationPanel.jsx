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

      <p><strong>Risk Score:</strong> {account.suspicion_score}</p>

      <div className="risk-bar">
        <div
          className="risk-fill"
          style={{ width: `${account.suspicion_score}%` }}
        />
      </div>

      <p><strong>Patterns:</strong></p>
      <ul>
        {account.detected_patterns.map((p, i) => (
          <li key={i}>{p}</li>
        ))}
      </ul>

      <p><strong>Ring:</strong> {account.ring_id}</p>
    </div>
  );
}

export default InvestigationPanel;
