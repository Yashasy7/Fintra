import React from "react";

const legendItems = [
  { color: "#ff4d4d", label: "Suspicious Account" },
  { color: "#00f5c4", label: "Normal Account" },
  { color: "#ffffff", label: "Highlighted Ring Member" },
  { color: "#334155", label: "Transaction Edge" }
];

export default function GraphLegend() {
  return (
    <div style={{ background: "#1a2233", borderRadius: 8, padding: 12, margin: 8, color: "#cbd5e1", fontSize: 13, boxShadow: "0 2px 8px #0002", maxWidth: 220 }}>
      <strong style={{ fontSize: 14 }}>Legend</strong>
      <ul style={{ listStyle: "none", padding: 0, margin: "8px 0 0 0" }}>
        {legendItems.map((item, i) => (
          <li key={i} style={{ display: "flex", alignItems: "center", marginBottom: 6 }}>
            <span style={{ display: "inline-block", width: 18, height: 18, borderRadius: "50%", background: item.color, marginRight: 10, border: "2px solid #222" }}></span>
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
