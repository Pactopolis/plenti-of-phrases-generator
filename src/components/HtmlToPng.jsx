// src/components/HtmlToPng.jsx
import { useRef, useState, useEffect } from "react";
import html2canvas from "html2canvas";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { processStyleFile } from "../helpers/StyleFiles";

const HtmlToPng = ({
  content,
  textColor,
  fontWeight,
  fontFamily = "Arial",
  wordList = [],
  styleYaml = "",
}) => {
  const contentRef = useRef(null);
  const containerRef = useRef(null);
  const [renderedContent, setRenderedContent] = useState(content);

  useEffect(() => {
    setRenderedContent(content);
  }, [content]);

  const handleDownload = async () => {
    const node = contentRef.current;
    if (!node) return;

    const hasKeyPattern =
      typeof content === "string" && content.includes("!{word}");

    if (hasKeyPattern && wordList.length > 0) {
      await downloadMultipleImages(node, content);
    } else {
      await downloadSingleImage(node);
    }
  };

  const downloadSingleImage = async (node) => {
    const originalTransform = node.style.transform;
    const originalPosition = node.style.position;
    const originalLeft = node.style.left;
    const originalBackground = node.style.background;
    const originalBorder = node.style.border;

    node.style.transform = "none";
    node.style.position = "relative";
    node.style.left = "0";
    node.style.background = "transparent";
    node.style.border = "none";

    try {
      const rect = node.getBoundingClientRect();
      const canvas = await html2canvas(node, {
        backgroundColor: null,
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
      node.style.transform = originalTransform;
      node.style.position = originalPosition;
      node.style.left = originalLeft;
      node.style.background = originalBackground;
      node.style.border = originalBorder;
    }
  };

  const downloadMultipleImages = async (node, originalContent) => {
    const originalTransform = node.style.transform;
    const originalPosition = node.style.position;
    const originalLeft = node.style.left;
    const originalBackground = node.style.background;
    const originalBorder = node.style.border;

    node.style.transform = "none";
    node.style.position = "relative";
    node.style.left = "0";
    node.style.background = "transparent";
    node.style.border = "none";

    try {
      const zip = new JSZip();
      const rect = node.getBoundingClientRect();
      const imgFolder = zip.folder("images");

      for (const word of wordList) {
        const replaced = originalContent.replace(/!{word}/g, word);
        setRenderedContent(replaced);
        await new Promise((resolve) => setTimeout(resolve, 10));

        const canvas = await html2canvas(node, {
          backgroundColor: null,
          scale: 2,
          useCORS: true,
          allowTaint: true,
          width: rect.width,
          height: rect.height,
        });

        const blob = await new Promise((resolve) =>
          canvas.toBlob(resolve, "image/png")
        );

        imgFolder.file(`${word}.png`, blob);
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      saveAs(zipBlob, "content_images.zip");
    } catch (error) {
      console.error("Error generating multiple PNGs:", error);
    } finally {
      setRenderedContent(originalContent);
      node.style.transform = originalTransform;
      node.style.position = originalPosition;
      node.style.left = originalLeft;
      node.style.background = originalBackground;
      node.style.border = originalBorder;
    }
  };

  const renderContent = () => {
    if (typeof renderedContent === "string") {
      try {
        if (!styleYaml?.trim()) {
          // Return plain spans if no styleYaml is provided
          return renderedContent.split(" ").map((word, index) => (
            <span
              key={index}
              style={{
                fontWeight: fontWeight || 400,
                color: textColor || "black",
                fontFamily: fontFamily || "Arial",
                cursor: "pointer",
                userSelect: "none",
                marginRight: "4px",
              }}
            >
              {word + " "}
            </span>
          ));
        }

        // Process YAML styles and return styled spans
        const styledSpans = processStyleFile(styleYaml, renderedContent);
        // Give default styles to the spans not affected by YAML styles
        return styledSpans.map((span, i) => {
          const style = span.props?.style || {};
          return (
            <span
              key={i}
              style={{
                fontWeight: fontWeight || 400,
                color: textColor || "black",
                fontFamily: fontFamily || "Arial",
                cursor: "pointer",
                userSelect: "none",
                marginRight: "4px",
                ...style, // YAML styles override props
              }}
            >
              {span.props?.children}
            </span>
          );
        });
      } catch (error) {
        console.error("Failed to render styled content:", error);
        return renderedContent;
      }
    }

    return renderedContent;
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
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            <p
              style={{
                fontSize: "20px",
                margin: 0,
                padding: 0,
                lineHeight: 1.2,
                maxWidth: "100%",
                textAlign: "center",
                overflowWrap: "break-word",
              }}
            >
              {renderContent()}
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
        {wordList.length > 0 &&
        typeof content === "string" &&
        content.includes("!{word}")
          ? "Download as ZIP"
          : "Download as PNG"}
      </button>
      <div style={{ fontSize: "12px", color: "#666", marginTop: "8px" }}>
        Drag the bottom-right corner to resize
      </div>
      {wordList.length > 0 &&
        typeof content === "string" &&
        content.includes("!{word}") && (
          <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
            Will create {wordList.length} images with !{"{word}"} replaced
          </div>
        )}
    </div>
  );
};

export default HtmlToPng;
