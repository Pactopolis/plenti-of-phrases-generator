import { useState } from "react";
import "./App.css";
import HtmlToPng from "./components/HtmlToPng";
import ColorPicker from "./components/ColorPicker";

function App() {
  const [inputText, setInputText] = useState("");
  const [textColor, setTextColor] = useState("#000000");

  return (
    <div className="app">
      <h1>HTML to PNG Converter</h1>
      <input
        type="text"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="Type your text here..."
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "10px",
          fontSize: "16px",
          borderRadius: "4px",
          border: "1px solid #ccc",
          boxSizing: "border-box",
        }}
      />
      <div
        style={{ position: "relative", width: "100%", marginBottom: "20px" }}
      >
        <ColorPicker onColorChange={setTextColor} />
      </div>
      <HtmlToPng
        content={inputText || "Type something above to see it rendered here..."}
        textColor={textColor}
      />
    </div>
  );
}

export default App;
