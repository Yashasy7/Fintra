import React from "react";

function SummaryPanel({ summary }) {
  return (
    <div className="summary-grid">
      <div className="card">
        <p>Total Accounts</p>
        <div className="summary-value">
          {summary.total_accounts_analyzed}
        </div>
      </div>

      <div className="card">
        <p>Suspicious Accounts</p>
        <div className="summary-value">
          {summary.suspicious_accounts_flagged}
        </div>
      </div>

      <div className="card">
        <p>Fraud Rings</p>
        <div className="summary-value">
          {summary.fraud_rings_detected}
        </div>
      </div>

      <div className="card">
        <p>Processing Time (s)</p>
        <div className="summary-value">
          {summary.processing_time_seconds}
        </div>
      </div>
    </div>
  );
}

export default SummaryPanel;
