// src/App.jsx
import { useState } from "react";
import "./App.css";
import HtmlToPng from "./components/HtmlToPng";
import ColorPicker from "./components/ColorPicker";
import BoldSlider from "./components/BoldSlider";
import WordList from "./components/WordList";

function App() {
  const [inputText, setInputText] = useState("");
  const [textColor, setTextColor] = useState("#000000");
  const [fontWeight, setFontWeight] = useState(400);
  const [wordList, setWordList] = useState([]);

  return (
    <div className="app">
      <h1>HTML to PNG Converter</h1>
      <input
        type="text"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="Type your text here... Use !{word} to insert words from your list"
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
        style={{
          position: "relative",
          width: "100%",
          marginBottom: "20px",
          display: "flex",
          gap: "10px",
          justifyContent: "center",
        }}
      >
        <ColorPicker onColorChange={setTextColor} />
        <BoldSlider onWeightChange={setFontWeight} />
        <WordList onWordListChange={setWordList} />
      </div>
      <HtmlToPng
        content={inputText || "Type something above to see it rendered here..."}
        textColor={textColor}
        fontWeight={fontWeight}
        wordList={wordList}
      />
    </div>
  );
}

export default App;
