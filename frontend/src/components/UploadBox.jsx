import { useState } from "react";
import axios from "axios";

export default function UploadBox({ setAnalysisData }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ DEPLOYMENT FIX: Read the API URL from environment variables.
  // If VITE_API_URL isn't set (local development), it defaults to localhost:8000.
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

  const handleAnalyze = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);

      // ✅ Use the dynamic API_BASE_URL
      const response = await axios.post(
        `${API_BASE_URL}/analyze`,
        formData,
        { 
            headers: { "Content-Type": "multipart/form-data" },
            // Add a timeout for large 10k datasets
            timeout: 30000 
        }
      );

      setAnalysisData(response.data);
      console.log("Analysis Complete: Records processed successfully.");
    } catch (err) {
      console.error("Analysis failed:", err);
      alert("Error: Could not connect to the forensic engine. Check if the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-bar" style={containerStyle}>
      <input
        type="file"
        accept=".csv"
        onChange={(e) => setFile(e.target.files[0])}
        className="file-input"
        style={inputStyle}
      />

      <button
        className="analyze-btn"
        onClick={handleAnalyze}
        disabled={loading || !file}
        style={loading ? loadingBtn : activeBtn}
      >
        {loading ? "🔍 Processing 10k Nodes..." : "🚀 Run Forensic Audit"}
      </button>
    </div>
  );
}

// Quick UI polish for the upload bar
const containerStyle = { display: 'flex', alignItems: 'center', gap: '15px' };
const inputStyle = { color: '#f5f7fa', fontSize: '14px' };
const activeBtn = { background: '#4cc9f0', color: '#000', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', border: 'none' };
const loadingBtn = { background: '#2d3748', color: '#a0aec0', padding: '10px 20px', borderRadius: '8px', cursor: 'not-allowed', border: 'none' };