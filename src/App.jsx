import { useState } from "react";
import "./App.css";
import HtmlToPng from "./components/HtmlToPng";

function App() {
  const [inputText, setInputText] = useState("");

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
          marginBottom: "20px",
          fontSize: "16px",
          borderRadius: "4px",
          border: "1px solid #ccc",
          boxSizing: "border-box",
        }}
      />
      <HtmlToPng
        content={inputText || "Type something above to see it rendered here..."}
      />
    </div>
  );
}

export default App;
