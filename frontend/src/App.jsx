import React, { useState } from "react";
import GraphView from "./components/GraphView";
import GraphLegend from "./components/GraphLegend";
import SummaryPanel from "./components/SummaryPanel";
import InvestigationPanel from "./components/InvestigationPanel";
import RingTable from "./components/RingTable";
import DownloadButton from "./components/DownloadButton";
import UploadBox from "./components/UploadBox";
import "./App.css";

function App() {
  const [analysisData, setAnalysisData] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);

  return (
    <div style={appContainer}>
      <div style={heroSection}>
        <div style={logoCircle}>
          <span style={{ fontSize: 32, color: '#4cc9f0' }}>💸</span>
        </div>
        <div>
          <h1 style={headerStyle}>FINTRA</h1>
          <div style={subtitleStyle}>AI-Powered Financial Forensics Engine</div>
        </div>
      </div>

      <div style={glassPanel}>
        <UploadBox setAnalysisData={setAnalysisData} />
        <SummaryPanel analysisData={analysisData} />
      </div>

      <div style={middleRow}>
        <div style={graphColumn}>
          <GraphLegend />
          <div style={graphSection}>
            <GraphView
              graph={analysisData && analysisData.graph ? analysisData.graph : null}
              suspicious={analysisData && analysisData.suspicious_accounts ? analysisData.suspicious_accounts : []}
              onNodeClick={setSelectedAccount}
            />
          </div>
        </div>

        <div style={investigationColumn}>
          <InvestigationPanel account={selectedAccount} />
        </div>
      </div>

      <div style={bottomRow}>
        <RingTable analysisData={analysisData} />
        <DownloadButton analysisData={analysisData} />
      </div>

      <footer style={footerStyle}>
        <span>© 2026 Fintra | Built for RIFT Hackathon</span>
      </footer>
    </div>
  );
}

const appContainer = {
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "0",
  boxSizing: "border-box",
  overflowY: "auto",
  background: 'radial-gradient(circle at top left, #0f2027, #0a0f14 60%)',
};

const heroSection = {
  display: 'flex',
  alignItems: 'center',
  gap: '18px',
  marginTop: '38px',
  marginBottom: '18px',
};

const logoCircle = {
  width: 60,
  height: 60,
  borderRadius: '50%',
  background: 'rgba(76,201,240,0.08)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 2px 16px 0 rgba(76,201,240,0.12)',
};

const subtitleStyle = {
  fontSize: '16px',
  color: '#9aa4af',
  fontWeight: 400,
  marginTop: '2px',
  letterSpacing: '0.5px',
};

const glassPanel = {
  width: '100%',
  maxWidth: 1100,
  margin: '0 auto',
  display: 'flex',
  flexWrap: 'wrap',
  gap: '18px',
  padding: '18px',
  borderRadius: '18px',
  background: 'rgba(255,255,255,0.07)',
  boxShadow: '0 4px 32px 0 rgba(76,201,240,0.08)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(255,255,255,0.10)',
  marginBottom: '18px',
};

const headerStyle = {
  margin: 0,
  fontWeight: 700,
  letterSpacing: '1px',
  fontSize: '32px',
  color: '#f5f7fa',
};

const middleRow = {
  display: 'flex',
  gap: '16px',
  width: '100%',
  maxWidth: 1100,
  margin: '0 auto',
  marginTop: '10px',
  alignItems: 'stretch',
  minHeight: 500,
};

const graphColumn = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
};

const graphSection = {
  flex: 1,
  minHeight: 0,
};

const investigationColumn = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
};

const bottomRow = {
  width: '100%',
  maxWidth: 1100,
  margin: '18px auto 0 auto',
};

const footerStyle = {
  textAlign: 'center',
  padding: '18px 0 8px 0',
  color: '#9aa4af',
  fontSize: '13px',
  marginTop: 'auto',
  width: '100%',
};

export default App;
