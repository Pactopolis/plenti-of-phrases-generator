// src/components/WordsUpload.jsx
import { useRef } from "react";
import { FaFileUpload } from "react-icons/fa";
import styles from "./WordsUpload.module.css";

function WordsUpload({ onWordListChange }) {
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  const parseWords = (content) => {
    return (
      content
        // Split by commas that are not preceded by a backslash
        .split(/(?<!\\),/g)
        // Trim whitespace from each word
        .map((w) => w.trim())
        // Filter out empty words
        .filter((w) => w.length > 0)
        // Remove diacritics (accents) from words
        .map((w) => w.normalize("NFD").replace(/\p{Diacritic}/gu, ""))
        // Remove duplicates if needed
        .filter((word, index, self) => self.indexOf(word) === index)
    );
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.name.endsWith(".words")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target.result;
          const words = parseWords(content);
          onWordListChange(words);
        } catch (error) {
          console.error("Error reading file:", error);
        }
      };
      reader.readAsText(file);
    } else {
      alert("Please select a .words file");
    }
    // Reset the input value so the same file can be selected again
    event.target.value = "";
  };

  return (
    <div className={styles.container} ref={containerRef}>
      <input
        type="file"
        ref={inputRef}
        accept=".words"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
      <button
        className={styles.button}
        title="Upload word list"
        onClick={() => inputRef.current?.click()}
      >
        <FaFileUpload />
      </button>
    </div>
  );
}

export default WordsUpload;
