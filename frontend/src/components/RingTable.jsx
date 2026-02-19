import React from "react";

function RingTable({ rings }) {
  return (
    <div className="card" style={{ marginTop: "30px" }}>
      <h3>Fraud Rings</h3>
      <table>
        <thead>
          <tr>
            <th>Ring ID</th>
            <th>Members</th>
            <th>Risk</th>
          </tr>
        </thead>
        <tbody>
          {rings.map((ring) => (
            <tr key={ring.ring_id}>
              <td>{ring.ring_id}</td>
              <td>{ring.member_accounts.join(", ")}</td>
              <td style={{ color: "#ff4d4d" }}>{ring.risk_score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default RingTable;
