import { useState, useEffect, useRef } from "react";
import { HexColorPicker, HexColorInput } from "react-colorful";
import { FaPalette } from "react-icons/fa";
import styles from "./ColorPicker.module.css";

function ColorPicker({ onColorChange }) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [rgbInput, setRgbInput] = useState("rgb(0, 0, 0)");
  const [colorHistory, setColorHistory] = useState([]);
  const [tempColor, setTempColor] = useState("#000000");
  const colorPickerRef = useRef(null);

  useEffect(() => {
    const r = parseInt(tempColor.slice(1, 3), 16);
    const g = parseInt(tempColor.slice(3, 5), 16);
    const b = parseInt(tempColor.slice(5, 7), 16);
    setRgbInput(`rgb(${r}, ${g}, ${b})`);
  }, [tempColor]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        colorPickerRef.current &&
        !colorPickerRef.current.contains(e.target)
      ) {
        setShowColorPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleColorChangeComplete = (color) => {
    onColorChange(color);
    if (color !== colorHistory[colorHistory.length - 1]) {
      setColorHistory((prev) =>
        [...prev.filter((c) => c !== color), color].slice(-9)
      );
    }
  };

  const handleRgbBlur = (value) => {
    const match = value.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (match) {
      const [r, g, b] = match
        .slice(1, 4)
        .map((n) => Math.min(255, Math.max(0, +n)));
      const hex = `#${[r, g, b]
        .map((x) => x.toString(16).padStart(2, "0"))
        .join("")}`;
      handleColorChangeComplete(hex);
    }
  };

  const HistorySwatch = ({ color, onSelect }) => (
    <div
      className={styles.historySwatch}
      style={{ backgroundColor: color }}
      onClick={() => onSelect(color)}
      title={color}
    />
  );

  return (
    <div className={styles.colorPickerContainer}>
      <button
        onClick={() => setShowColorPicker((prev) => !prev)}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "5px",
          color: "rgba(255,255,255,0.87)",
          fontSize: "20px",
        }}
        title="Change color"
      >
        <FaPalette />
      </button>

      {showColorPicker && (
        <div ref={colorPickerRef} className={styles.pickerPopup}>
          <div style={{ flex: 1 }}>
            <HexColorPicker
              color={tempColor}
              onChange={setTempColor}
              onMouseUp={() => handleColorChangeComplete(tempColor)}
            />
            <div
              style={{
                marginTop: "10px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              {/* Hex Input */}
              <div className={styles.inputGroup}>
                <label htmlFor="hex-input" className={styles.label}>
                  Hex:
                </label>
                <HexColorInput
                  color={tempColor}
                  onChange={setTempColor}
                  onBlur={(e) => handleColorChangeComplete(e.target.value)}
                  prefixed
                  className={styles.textInput}
                />
              </div>
              {/* RGB Input */}
              <div className={styles.inputGroup}>
                <label htmlFor="rgb-input" className={styles.label}>
                  RGB:
                </label>
                <input
                  type="text"
                  value={rgbInput}
                  onChange={(e) => setRgbInput(e.target.value)}
                  onBlur={(e) => handleRgbBlur(e.target.value)}
                  placeholder="rgb(r, g, b)"
                  className={styles.textInput}
                />
              </div>
            </div>
          </div>
          <div className={styles.historyColumn}>
            {colorHistory.map((color, idx) => (
              <HistorySwatch
                key={idx}
                color={color}
                onSelect={handleColorChangeComplete}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ColorPicker;
