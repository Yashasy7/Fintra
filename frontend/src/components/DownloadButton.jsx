import React from "react";

function DownloadButton({ data }) {
  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "fintra_report.json";
    a.click();
  };

  return (
    <button className="download-btn" onClick={handleDownload}>
      Download Report
    </button>
  );
}

export default DownloadButton;
