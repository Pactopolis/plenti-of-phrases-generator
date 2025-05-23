import { useState, useRef, useEffect } from "react";
import { FaFont } from "react-icons/fa";
import styles from "./FontSelector.module.css";

// List of common web-safe fonts
const FONTS = [
  "Arial",
  "Arial Black",
  "Arial Narrow",
  "Calibri",
  "Cambria",
  "Cambria Math",
  "Comic Sans MS",
  "Courier",
  "Courier New",
  "Georgia",
  "Helvetica",
  "Impact",
  "Lucida Console",
  "Lucida Sans Unicode",
  "Microsoft Sans Serif",
  "Palatino Linotype",
  "Tahoma",
  "Times New Roman",
  "Trebuchet MS",
  "Verdana",
];

function FontSelector({ onFontChange }) {
  const [showFontList, setShowFontList] = useState(false);
  const [selectedFont, setSelectedFont] = useState("Arial");
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowFontList(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFontSelect = (font) => {
    setSelectedFont(font);
    onFontChange?.(font);
    setShowFontList(false);
  };

  return (
    <div className={styles.container} ref={containerRef}>
      <button
        className={styles.button}
        title="Change font"
        onClick={() => setShowFontList((prev) => !prev)}
      >
        <FaFont />
      </button>

      {showFontList && (
        <div className={styles.fontListContainer}>
          <div className={styles.fontList}>
            {FONTS.map((font) => (
              <div
                key={font}
                className={`${styles.fontItem} ${
                  font === selectedFont ? styles.selected : ""
                }`}
                style={{ fontFamily: font }}
                onClick={() => handleFontSelect(font)}
              >
                {font}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default FontSelector;
