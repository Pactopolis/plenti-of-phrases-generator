import { useRef, useState, useEffect } from "react";
import html2canvas from "html2canvas";
import JSZip from "jszip";

const HtmlToPng = ({ content, textColor, fontWeight, words = [] }) => {
  const contentRef = useRef(null);
  const hiddenWrapperRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 500, height: 300 });

  // Track dimensions of the resizable content box
  useEffect(() => {
    if (!contentRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width: Math.round(width), height: Math.round(height) });
      }
    });

    resizeObserver.observe(contentRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Core image rendering logic (used by zip and single)
  const renderImageFromText = async (text) => {
    if (!contentRef.current || !hiddenWrapperRef.current) return null;

    // Create a fresh div instead of cloning (ensures styling is consistent)
    const container = document.createElement("div");

    Object.assign(container.style, {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "transparent",
      width: `${dimensions.width}px`,
      height: `${dimensions.height}px`,
      position: "absolute",
      left: "-9999px",
      top: "0",
      overflow: "hidden",
      fontSize: "20px",
      color: textColor || "black",
      fontWeight: fontWeight || 400,
      lineHeight: "1.2",
      textAlign: "center",
      padding: "0",
      margin: "0",
      fontFamily: "inherit",
    });

    const p = document.createElement("p");
    p.innerText = text;
    Object.assign(p.style, {
      margin: "0",
      padding: "0",
      maxWidth: "100%",
      overflowWrap: "break-word",
    });

    container.appendChild(p);

    hiddenWrapperRef.current.innerHTML = "";
    hiddenWrapperRef.current.appendChild(container);

    await new Promise((res) => requestAnimationFrame(res));

    const canvas = await html2canvas(container, {
      backgroundColor: null,
      scale: 2,
      useCORS: true,
      allowTaint: true,
      width: dimensions.width,
      height: dimensions.height,
    });

    const finalCanvas = document.createElement("canvas");
    finalCanvas.width = dimensions.width;
    finalCanvas.height = dimensions.height;
    const ctx = finalCanvas.getContext("2d");
    ctx.drawImage(canvas, 0, 0, dimensions.width, dimensions.height);

    return finalCanvas.toDataURL("image/png");
  };

  const handleDownload = async () => {
    const zip = new JSZip();
    const hasPlaceholder =
      typeof content === "string" && content.includes("!{word}");

    if (hasPlaceholder && words.length > 0) {
      for (const word of words) {
        const renderedText = content.replace(/!\{word\}/g, word);
        const dataUrl = await renderImageFromText(renderedText);
        if (dataUrl) {
          zip.file(`${word}.png`, dataUrl.split(",")[1], { base64: true });
        }
      }

      const blob = await zip.generateAsync({ type: "blob" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "word_images.zip";
      a.click();
    } else {
      const dataUrl = await renderImageFromText(
        typeof content === "string" ? content : content?.toString?.() || ""
      );

      if (dataUrl) {
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = "content.png";
        link.click();
      }
    }
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
      {/* UI Display */}
      <div
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
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            minWidth: "200px",
            minHeight: "100px",
            maxWidth: "100%",
            maxHeight: "80vh",
            width: "500px",
            height: "300px",
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <p
            style={{
              fontSize: "20px",
              color: textColor || "black",
              fontWeight: fontWeight || 400,
              margin: 0,
              padding: 0,
              lineHeight: 1.2,
              maxWidth: "100%",
              textAlign: "center",
              overflowWrap: "break-word",
            }}
          >
            {typeof content === "string" ? content : content}
          </p>
        </div>
      </div>

      {/* Resolution Label */}
      <div style={{ marginTop: "8px", fontSize: "14px", color: "#555" }}>
        {dimensions.width} × {dimensions.height}
      </div>

      {/* Offscreen Clone for PNG */}
      <div
        ref={hiddenWrapperRef}
        style={{ position: "absolute", top: "-9999px", left: "-9999px" }}
      />

      {/* Download Button */}
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

      {/* UI Tip */}
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
