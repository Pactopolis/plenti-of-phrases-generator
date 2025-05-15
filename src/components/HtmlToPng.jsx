import { useRef } from "react";
import html2canvas from "html2canvas";

const HtmlToPng = ({ content }) => {
  const contentRef = useRef(null);

  const handleDownload = async () => {
    if (contentRef.current) {
      try {
        const canvas = await html2canvas(contentRef.current);
        const image = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = image;
        link.download = "content.png";
        link.click();
      } catch (error) {
        console.error("Error generating PNG:", error);
      }
    }
  };

  return (
    <div className="html-to-png-container">
      <div
        ref={contentRef}
        className="content-container"
        style={{
          padding: "20px",
          background: "white",
          border: "1px solid rgb(204, 204, 204)",
          borderRadius: "8px",
          margin: "20px 0",
        }}
      >
        {content}
      </div>
      <button
        onClick={handleDownload}
        style={{
          padding: "10px 20px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Download as PNG
      </button>
    </div>
  );
};

export default HtmlToPng;
