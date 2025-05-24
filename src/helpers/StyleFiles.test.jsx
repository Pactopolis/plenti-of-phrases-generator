import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render } from "@testing-library/react";

import { processStyleFile, applyRegexPattern } from "./StyleFiles";

describe("StyleFiles Module", () => {
  const baseText =
    "I was running and eating while spending $5.00 on #lunch and #coffee.";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("matches words ending in 'ing'", () => {
    const yamlText = `
type: regex
pattern: '\\b\\w+ing\\b'
style:
  color: purple
`;

    const spans = processStyleFile(yamlText, baseText);
    const { container } = render(<>{spans}</>);

    const matchedSpans = Array.from(container.querySelectorAll("span")).filter(
      (span) => ["running", "eating"].includes(span.textContent)
    );

    expect(matchedSpans.length).toBe(2);
    matchedSpans.forEach((span) => {
      const computed = getComputedStyle(span);
      expect(computed.getPropertyValue("color")).toBe("rgb(128, 0, 128)");
    });
  });

  it("matches dollar amounts like $12.34", () => {
    const yamlText = `
type: regex
pattern: '\\$\\d+(\\.\\d{2})?'
style:
  color: green
  fontWeight: bold
`;

    const spans = processStyleFile(yamlText, baseText);
    const { container } = render(<>{spans}</>);

    const matchedSpans = Array.from(container.querySelectorAll("span")).filter(
      (span) => span.textContent === "$5.00"
    );

    expect(matchedSpans.length).toBe(1);
    const computed = getComputedStyle(matchedSpans[0]);
    expect(computed.getPropertyValue("color")).toBe("rgb(0, 128, 0)");
    expect(computed.getPropertyValue("font-weight")).toMatch(/bold|700|600/i);
  });

  it("matches hashtags like #lunch and #coffee", () => {
    const yamlText = `
type: regex
pattern: '#\\w+'
style:
  color: blue
  textDecoration: underline
`;

    const spans = processStyleFile(yamlText, baseText);
    const { container } = render(<>{spans}</>);

    const matchedSpans = Array.from(container.querySelectorAll("span")).filter(
      (span) => span.textContent === "#lunch"
    );

    expect(matchedSpans.length).toBe(1);
    const computed = getComputedStyle(matchedSpans[0]);
    expect(computed.getPropertyValue("color")).toBe("rgb(0, 0, 255)");
    expect(computed.getPropertyValue("text-decoration")).toMatch(/underline/);
  });

  it("returns a span for every token (words and spaces)", () => {
    const text = "The quick brown fox jumps over the lazy dog";
    const yamlText = `
type: regex
pattern: '\\b(f\\w+|lazy)\\b'
style:
  color: orange
`;

    const spans = processStyleFile(yamlText, text);
    const { container } = render(<>{spans}</>);

    const renderedSpans = container.querySelectorAll("span");
    const tokenCount = [...text.matchAll(/\S+|\s+/g)].length;
    expect(renderedSpans.length).toBe(tokenCount);
  });

  it("applyRegexPattern returns span elements with matching styles", () => {
    const text = "I like banana";
    const spans = applyRegexPattern(text, "banana", {
      color: "green",
    });

    const { container } = render(<>{spans}</>);
    const bananaSpan = Array.from(container.querySelectorAll("span")).find(
      (el) => el.textContent === "banana"
    );

    expect(bananaSpan).toBeTruthy();
    const computed = getComputedStyle(bananaSpan);
    expect(computed.getPropertyValue("color")).toBe("rgb(0, 128, 0)");
  });

  it("processStyleFile returns fallback span on invalid config", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const invalidYaml = `
type: regex
pattern:
style:
`;

    const text = "Any text here";
    const spans = processStyleFile(invalidYaml, text);
    const { container } = render(<>{spans}</>);
    const onlySpan = container.querySelector("span");

    expect(onlySpan).toBeTruthy();
    expect(onlySpan.textContent).toBe(text);
  });
});
