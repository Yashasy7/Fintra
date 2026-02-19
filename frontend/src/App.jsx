import React, { useState } from "react";
import GraphView from "./components/GraphView";
import SummaryPanel from "./components/SummaryPanel";
import InvestigationPanel from "./components/InvestigationPanel";
import RingTable from "./components/RingTable";
import DownloadButton from "./components/DownloadButton";
import UploadBox from "./components/UploadBox";
import "./App.css";

function App() {
  const [data, setData] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);

  return (
    <div className="app-container">

      {/* Top Bar */}
      <header className="top-bar">
        <div className="brand">
          <h1>FINTRA</h1>
          <span className="subtitle">
            AI-Powered Financial Forensics Engine
          </span>
        </div>

        <UploadBox setData={setData} />
      </header>

      {data && (
        <>
          <div className="dashboard">

            {/* LEFT SIDE */}
            <div className="left-zone">
              <div className="graph-card">

                {/* Graph Header + Legend */}
                <div className="graph-header">
                  <h3>Fraud Network</h3>

                  <div className="graph-legend">
                    <div className="legend-item">
                      <span className="legend-dot normal"></span>
                      Normal
                    </div>

                    <div className="legend-item">
                      <span className="legend-dot suspicious"></span>
                      Suspicious
                    </div>

                    <div className="legend-item">
                      <span className="legend-dot active"></span>
                      Active Ring
                    </div>
                  </div>
                </div>

                <GraphView
                  graph={data.graph}
                  suspicious={data.suspicious_accounts}
                  onNodeClick={setSelectedAccount}
                />
              </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="right-zone">
              <SummaryPanel summary={data.summary} />
              <InvestigationPanel account={selectedAccount} />
              <DownloadButton data={data} />
            </div>

          </div>

          {/* Fraud Rings Table */}
          <div className="rings-section">
            <RingTable rings={data.fraud_rings} />
          </div>
        </>
      )}

    </div>
  );
}

export default App;
