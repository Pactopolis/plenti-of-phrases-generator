import { useState, useRef, useEffect } from "react";
import { FaListUl } from "react-icons/fa";
import styles from "./WordList.module.css";

function WordList({ onChange }) {
  const [showModal, setShowModal] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [tags, setTags] = useState([]);
  const inputRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setShowModal(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAddTag = (e) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      const newTag = inputValue.trim();
      setTags((prev) => {
        const updated = [...new Set([...prev, newTag])].sort((a, b) =>
          a.localeCompare(b)
        );
        onChange?.(updated);
        return updated;
      });
      setInputValue("");
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags((prev) => {
      const updated = prev.filter((tag) => tag !== tagToRemove);
      onChange?.(updated);
      return updated;
    });
  };

  return (
    <div className={styles.container}>
      <button
        className={styles.button}
        title="Add words"
        onClick={() => setShowModal((prev) => !prev)}
      >
        <FaListUl />
      </button>

      {showModal && (
        <div ref={modalRef} className={styles.modal}>
          <div className={styles.inner}>
            <div className={styles.wrapper}>
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Type a word and press Enter..."
                className={styles.input}
              />
              <div className={styles.tagContainer}>
                {tags.map((tag) => (
                  <div key={tag} className={styles.tag}>
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className={styles.removeButton}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WordList;
