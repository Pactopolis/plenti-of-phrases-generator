// src/App.jsx
import { useState } from "react";
import "./App.css";
import HtmlToPng from "./components/HtmlToPng";
import ColorPicker from "./components/ColorPicker";
import BoldSlider from "./components/BoldSlider";
import FontSelector from "./components/FontSelector";
import WordList from "./components/WordList";
import WordsUpload from "./components/WordsUpload";

function App() {
  const [inputText, setInputText] = useState("");
  const [textColor, setTextColor] = useState("#000000");
  const [fontWeight, setFontWeight] = useState(400);
  const [fontFamily, setFontFamily] = useState("Arial");
  const [wordList, setWordList] = useState([]);
  const [styleYaml, setStyleYaml] = useState("");

  const handleFileDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith(".words")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const words = event.target.result.split(",").map((word) => word.trim());
        setWordList((prevList) => [...new Set([...prevList, ...words])].sort());
      };
      reader.readAsText(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div className="app">
      <h1>HTML to PNG Converter</h1>
      <input
        type="text"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        onDrop={handleFileDrop}
        onDragOver={handleDragOver}
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
        <FontSelector onFontChange={setFontFamily} />
        <WordList onWordListChange={setWordList} wordList={wordList} />
        <WordsUpload onWordListChange={setWordList} wordList={wordList} />
      </div>
      <HtmlToPng
        content={inputText || "Type something above to see it rendered here..."}
        textColor={textColor}
        fontWeight={fontWeight}
        fontFamily={fontFamily}
        wordList={wordList}
        styleYaml={styleYaml}
      />
    </div>
  );
}

export default App;
