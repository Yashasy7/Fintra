import { useState } from "react";
import axios from "axios";

export default function UploadBox({ setAnalysisData }) {
  const [file, setFile] = useState(null);

  const handleAnalyze = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post(
      "http://127.0.0.1:8000/analyze",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    setAnalysisData(response.data);
  };

  return (
    <div style={boxStyle}>
      <input
        type="file"
        accept=".csv"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <button style={buttonStyle} onClick={handleAnalyze}>
        Analyze Transactions
      </button>
    </div>
  );
}

const boxStyle = {
  background: "rgba(255,255,255,0.05)",
  padding: "14px",
  borderRadius: "10px",
  border: "1px solid rgba(255,255,255,0.08)",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center"
};

const buttonStyle = {
  padding: "8px 18px",
  backgroundColor: "#1f8a70",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer"
};
