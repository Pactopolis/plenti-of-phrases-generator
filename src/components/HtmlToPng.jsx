import { useRef } from "react";
import html2canvas from "html2canvas";

const HtmlToPng = ({ content, textColor }) => {
  const contentRef = useRef(null);
  const containerRef = useRef(null);

  const handleDownload = async () => {
    const node = contentRef.current;
    if (!node) return;

    // Store original styles
    const originalTransform = node.style.transform;
    const originalPosition = node.style.position;
    const originalLeft = node.style.left;

    // Disable transform temporarily
    node.style.transform = "none";
    node.style.position = "relative";
    node.style.left = "0";

    try {
      const rect = node.getBoundingClientRect();

      const canvas = await html2canvas(node, {
        backgroundColor: "white",
        scale: 2,
        useCORS: true,
        allowTaint: true,
        width: rect.width,
        height: rect.height,
      });

      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = "content.png";
      link.click();
    } catch (error) {
      console.error("Error generating PNG:", error);
    } finally {
      // Restore original styles
      node.style.transform = originalTransform;
      node.style.position = originalPosition;
      node.style.left = originalLeft;
    }
  };

  // Handle string content by splitting it into clickable words
  const renderContent = () => {
    if (typeof content === "string") {
      return content.split(" ").map((word, index) => (
        <span
          key={index}
          onClick={() => console.log(word)}
          style={{
            cursor: "pointer",
            marginRight: "4px",
            userSelect: "none",
          }}
        >
          {word}
        </span>
      ));
    }

    // If content is a JSX element or other non-string, render it as-is
    return content;
  };

  return (
    <div
      className="html-to-png-container"
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        padding: "20px 0",
      }}
    >
      <div
        ref={containerRef}
        style={{
          position: "relative",
          width: "100%",
          height: "400px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          ref={contentRef}
          className="content-container"
          style={{
            padding: 0,
            background: "white",
            borderRadius: "8px",
            border: "1px solid rgba(0, 0, 0, 0.1)",
            resize: "both",
            overflow: "auto",
            scrollbarWidth: "none", // Firefox
            msOverflowStyle: "none", // IE 10+
            minWidth: "200px",
            minHeight: "100px",
            maxWidth: "100%",
            maxHeight: "80vh",
            width: "500px",
            height: "300px",
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "auto",
              scrollbarWidth: "none", // Firefox
              msOverflowStyle: "none", // IE 10+
            }}
          >
            <p
              style={{
                fontSize: "20px",
                color: textColor || "black",
                margin: 0, // Remove default margin
                padding: 0, // Ensure no padding
                lineHeight: 1.2, // Optional: tight line spacing
                maxWidth: "100%",
                textAlign: "center",
                overflowWrap: "break-word",
              }}
            >
              {typeof content === "string"
                ? content.split(" ").map((word, index) => (
                    <span
                      key={index}
                      onClick={() => console.log(word)}
                      style={{
                        cursor: "pointer",
                        userSelect: "none",
                      }}
                    >
                      {word + " "}
                    </span>
                  ))
                : content}
            </p>
          </div>
        </div>
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
          marginTop: "20px",
        }}
      >
        Download as PNG
      </button>
      <div
        style={{
          fontSize: "12px",
          color: "#666",
          marginTop: "8px",
        }}
      >
        Drag the bottom-right corner to resize
      </div>
    </div>
  );
};

export default HtmlToPng;
