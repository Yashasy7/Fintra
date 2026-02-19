import { useState } from "react";
import UploadBox from "./components/UploadBox";
import GraphView from "./components/GraphView";
import RingTable from "./components/RingTable";
import DownloadButton from "./components/DownloadButton";
import SummaryPanel from "./components/SummaryPanel";
import InvestigationPanel from "./components/InvestigationPanel";

function App() {
  const [analysisData, setAnalysisData] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);

  return (
    <div style={appContainer}>
      <h1 style={headerStyle}>
        FINTRA – Financial Forensics Engine
      </h1>

      <UploadBox setAnalysisData={setAnalysisData} />
      <SummaryPanel analysisData={analysisData} />

      <div style={mainContent}>
        <div style={graphSection}>
          <GraphView
            analysisData={analysisData}
            setSelectedAccount={setSelectedAccount}
          />
        </div>

        <div style={sideSection}>
          <InvestigationPanel selectedAccount={selectedAccount} />
          <RingTable analysisData={analysisData} />
          <DownloadButton analysisData={analysisData} />
        </div>
      </div>
    </div>
  );
}

const appContainer = {
  height: "100vh",
  display: "flex",
  flexDirection: "column",
  padding: "12px",
  boxSizing: "border-box"
};

const headerStyle = {
  textAlign: "center",
  margin: "6px 0 10px 0",
  fontWeight: "600",
  letterSpacing: "1px",
  fontSize: "22px",
  color: "#f5f7fa"
};

const mainContent = {
  flex: 1,
  display: "flex",
  gap: "14px",
  marginTop: "10px"
};

const graphSection = {
  flex: 3,
  height: "100%"
};

const sideSection = {
  flex: 1.2,
  display: "flex",
  flexDirection: "column",
  gap: "12px",
  overflow: "hidden"
};

export default App;
