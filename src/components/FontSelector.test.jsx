import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import FontSelector from "./FontSelector";
import styles from "./FontSelector.module.css";

describe("FontSelector", () => {
  const mockOnFontChange = vi.fn();
  const allFonts = [
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

  beforeEach(() => {
    mockOnFontChange.mockClear();
  });

  it("renders the font selector button", () => {
    render(<FontSelector onFontChange={mockOnFontChange} />);
    const button = screen.getByTitle("Change font");
    expect(button).toBeInTheDocument();
  });

  it("shows all supported fonts when button is clicked", () => {
    render(<FontSelector onFontChange={mockOnFontChange} />);
    const button = screen.getByTitle("Change font");

    fireEvent.click(button);

    // Check if all fonts are visible
    allFonts.forEach((font) => {
      expect(screen.getByText(font)).toBeInTheDocument();
    });
  });

  it("applies correct font family style to each font option", () => {
    render(<FontSelector onFontChange={mockOnFontChange} />);
    const button = screen.getByTitle("Change font");

    fireEvent.click(button);

    allFonts.forEach((font) => {
      const fontElement = screen.getByText(font);
      expect(fontElement).toHaveStyle({ fontFamily: font });
    });
  });

  it("selects a font and calls onFontChange when a font is clicked", () => {
    render(<FontSelector onFontChange={mockOnFontChange} />);
    const button = screen.getByTitle("Change font");

    // Open font list
    fireEvent.click(button);

    // Select a font
    const timesNewRoman = screen.getByText("Times New Roman");
    fireEvent.click(timesNewRoman);

    // Check if callback was called with correct font
    expect(mockOnFontChange).toHaveBeenCalledWith("Times New Roman");

    // Check if font list is closed
    expect(screen.queryByText("Arial")).not.toBeInTheDocument();
  });

  it("closes font list when clicking outside", () => {
    render(<FontSelector onFontChange={mockOnFontChange} />);
    const button = screen.getByTitle("Change font");

    // Open font list
    fireEvent.click(button);
    expect(screen.getByText("Arial")).toBeInTheDocument();

    // Click outside
    fireEvent.mouseDown(document.body);

    // Check if font list is closed
    expect(screen.queryByText("Arial")).not.toBeInTheDocument();
  });

  it("highlights the selected font", () => {
    render(<FontSelector onFontChange={mockOnFontChange} />);
    const button = screen.getByTitle("Change font");

    // Open font list
    fireEvent.click(button);

    // Arial should be selected by default
    const arialOption = screen.getByText("Arial");
    expect(arialOption).toHaveClass(styles.selected);
  });

  it("toggles font list visibility when button is clicked multiple times", () => {
    render(<FontSelector onFontChange={mockOnFontChange} />);
    const button = screen.getByTitle("Change font");

    // First click should open the list
    fireEvent.click(button);
    expect(screen.getByText("Arial")).toBeInTheDocument();

    // Second click should close the list
    fireEvent.click(button);
    expect(screen.queryByText("Arial")).not.toBeInTheDocument();

    // Third click should open the list again
    fireEvent.click(button);
    expect(screen.getByText("Arial")).toBeInTheDocument();
  });

  it("maintains selected font state after closing and reopening", () => {
    render(<FontSelector onFontChange={mockOnFontChange} />);
    const button = screen.getByTitle("Change font");

    // Open font list and select a font
    fireEvent.click(button);
    const timesNewRoman = screen.getByText("Times New Roman");
    fireEvent.click(timesNewRoman);

    // Reopen font list
    fireEvent.click(button);

    // Check if the previously selected font is still highlighted
    const timesNewRomanOption = screen.getByText("Times New Roman");
    expect(timesNewRomanOption).toHaveClass(styles.selected);
  });
});
