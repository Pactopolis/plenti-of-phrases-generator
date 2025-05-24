// src/helpers/StyleFiles.jsx (browser-compatible)
import yaml from "js-yaml";
import React from "react";

/**
 * Helper function to apply regex pattern matching and return styled span elements
 * @param {string} text - The input text to search
 * @param {string} pattern - The regex pattern to match
 * @param {Object} style - The style object to apply
 * @returns {Array<JSX.Element>} Array of <span> elements with matched text and styles
 */
const applyRegexPattern = (text, pattern, style) => {
  const regex = new RegExp(pattern, "g");
  const matchRanges = [];
  let match;

  while ((match = regex.exec(text)) !== null) {
    matchRanges.push({
      start: match.index,
      end: match.index + match[0].length,
    });
  }

  const tokens = [];
  const wordOrSpaceRegex = /\S+|\s+/g;
  let tokenMatch;
  while ((tokenMatch = wordOrSpaceRegex.exec(text)) !== null) {
    tokens.push({
      text: tokenMatch[0],
      start: tokenMatch.index,
      end: tokenMatch.index + tokenMatch[0].length,
    });
  }

  let key = 0;
  return tokens.map((token) => {
    const isStyled = matchRanges.some(
      (range) => token.start >= range.start && token.end <= range.end
    );

    return (
      <span key={`span-${key++}`} style={isStyled ? style : undefined}>
        {token.text}
      </span>
    );
  });
};

/**
 * Fetch and parse a YAML style file in the browser
 * @param {string} url - Path to the .style YAML file
 * @param {string} text - The text to process
 * @returns {Promise<Array<JSX.Element>>} Array of styled and plain <span> elements
 */
const processStyleFile = (yamlText, text) => {
  try {
    const styleConfig = yaml.load(yamlText);

    if (!styleConfig.type || !styleConfig.pattern || !styleConfig.style) {
      throw new Error("Invalid style configuration: missing required fields");
    }

    switch (styleConfig.type.toLowerCase()) {
      case "regex":
        return applyRegexPattern(text, styleConfig.pattern, styleConfig.style);
      default:
        throw new Error(`Unsupported style type: ${styleConfig.type}`);
    }
  } catch (error) {
    console.error("Error processing style:", error);
    return [<span key="error">{text}</span>];
  }
};

export { processStyleFile, applyRegexPattern };
