// src/components/FontSelector.jsx
import { useState, useRef, useEffect } from "react";
import { FaFont } from "react-icons/fa";
import styles from "./FontSelector.module.css";

function FontSelector({ onFontChange }) {
  const [showSelector, setShowSelector] = useState(false);
  const [selectedFont, setSelectedFont] = useState("Arial");
  const selectorRef = useRef(null);

  const fonts = [
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

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (selectorRef.current && !selectorRef.current.contains(e.target)) {
        setShowSelector(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFontChange = (font) => {
    setSelectedFont(font);
    onFontChange?.(font);
    setShowSelector(false);
  };

  return (
    <div className={styles.container}>
      <button
        className={styles.button}
        title="Change font"
        onClick={() => setShowSelector((prev) => !prev)}
      >
        <FaFont />
      </button>

      {showSelector && (
        <div ref={selectorRef} className={styles.selectorContainer}>
          <div className={styles.selectorInner}>
            <div className={styles.fontList}>
              {fonts.map((font) => (
                <div
                  key={font}
                  className={`${styles.fontOption} ${
                    selectedFont === font ? styles.selected : ""
                  }`}
                  style={{ fontFamily: font }}
                  onClick={() => handleFontChange(font)}
                >
                  {font}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FontSelector;
