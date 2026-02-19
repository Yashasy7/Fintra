
import React from "react";
import './RingTable.css';

function RingTable({ analysisData }) {
  const rings = analysisData && analysisData.fraud_rings ? analysisData.fraud_rings : [];
  return (
    <div className="card ring-table-card">
      <h3 style={{ marginBottom: 16 }}>Fraud Rings</h3>
      <div className="ring-table-wrapper">
        <table className="ring-table">
          <thead>
            <tr>
              <th>Ring ID</th>
              <th>Pattern Type</th>
              <th>Member Count</th>
              <th>Members</th>
              <th>Risk</th>
            </tr>
          </thead>
          <tbody>
            {rings.length === 0 ? (
              <tr><td colSpan={5} className="ring-table-empty">No rings detected</td></tr>
            ) : (
              rings.map((ring, idx) => (
                <tr key={ring.ring_id} className={idx % 2 === 0 ? "ring-row-even" : "ring-row-odd"}>
                  <td>{ring.ring_id}</td>
                  <td>{ring.pattern_type || '--'}</td>
                  <td>{ring.member_accounts ? ring.member_accounts.length : '--'}</td>
                  <td className="ring-members-cell">{ring.member_accounts ? ring.member_accounts.join(", ") : '--'}</td>
                  <td className="ring-risk-cell">{ring.risk_score}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RingTable;
