// src/components/WordList.jsx
import { useState, useRef, useEffect } from "react";
import { FaListUl } from "react-icons/fa";
import styles from "./WordList.module.css";

function WordList({ onWordListChange, wordList = [] }) {
  const [showInput, setShowInput] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowInput(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (showInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showInput]);

  const handleAddWord = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      const newList = [...wordList, inputValue.trim()].sort();
      onWordListChange?.(newList);
      setInputValue("");
    }
  };

  const handleRemoveWord = (wordToRemove) => {
    onWordListChange?.(wordList.filter((word) => word !== wordToRemove));
  };

  return (
    <div className={styles.container} ref={containerRef}>
      <button
        className={styles.button}
        title="Manage word list"
        onClick={() => setShowInput((prev) => !prev)}
      >
        <FaListUl />
      </button>

      {showInput && (
        <div className={styles.inputContainer}>
          <form onSubmit={handleAddWord}>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Add word or phrase..."
              className={styles.input}
            />
          </form>

          {wordList.length > 0 && (
            <div className={styles.wordListContainer}>
              {wordList.map((word, index) => (
                <div key={index} className={styles.wordItem}>
                  <span>{word}</span>
                  <button
                    className={styles.removeButton}
                    onClick={() => handleRemoveWord(word)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default WordList;
