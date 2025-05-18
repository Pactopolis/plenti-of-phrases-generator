import { useState, useRef, useEffect } from "react";
import { FaBold } from "react-icons/fa";
import styles from "./BoldSlider.module.css";

function BoldSlider({ onWeightChange }) {
  const [showSlider, setShowSlider] = useState(false);
  const [weight, setWeight] = useState(400);
  const sliderRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sliderRef.current && !sliderRef.current.contains(e.target)) {
        setShowSlider(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleWeightChange = (newWeight) => {
    setWeight(newWeight);
    onWeightChange?.(newWeight);
  };

  return (
    <div className={styles.container}>
      <button
        className={styles.button}
        title="Change font weight"
        onClick={() => setShowSlider((prev) => !prev)}
      >
        <FaBold />
      </button>

      {showSlider && (
        <div ref={sliderRef} className={styles.sliderContainer}>
          <div className={styles.sliderInner}>
            <div className={styles.sliderWrapper}>
              <div
                className={styles.weightDisplay}
                style={{ fontWeight: weight }}
              >
                {weight}
              </div>
              <div className={styles.sliderTrack}>
                <span className={styles.minLabel}>100</span>
                <input
                  type="range"
                  min="100"
                  max="900"
                  step="100"
                  value={weight}
                  onChange={(e) => handleWeightChange(Number(e.target.value))}
                  className={styles.slider}
                />
                <span className={styles.maxLabel}>900</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BoldSlider;
