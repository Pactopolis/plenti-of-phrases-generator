import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ColorPicker from "./ColorPicker";

// Mock handler for color change
const onColorChange = vi.fn();

describe("ColorPicker Component", () => {
  beforeEach(() => {
    onColorChange.mockClear();
  });

  it("renders palette button", () => {
    render(<ColorPicker onColorChange={onColorChange} />);
    const button = screen.getByTitle(/change color/i);
    expect(button).toBeInTheDocument();
  });

  it("shows color picker popup when button is clicked", () => {
    render(<ColorPicker onColorChange={onColorChange} />);
    const button = screen.getByTitle(/change color/i);
    fireEvent.click(button);
    expect(screen.getByText(/hex:/i)).toBeInTheDocument();
    expect(screen.getByText(/rgb:/i)).toBeInTheDocument();
  });

  it("updates RGB input when temp color changes", () => {
    render(<ColorPicker onColorChange={onColorChange} />);
    fireEvent.click(screen.getByTitle(/change color/i));

    const rgbInput = screen.getByPlaceholderText(/rgb\(r, g, b\)/i);
    fireEvent.blur(rgbInput, { target: { value: "rgb(255, 0, 0)" } });

    expect(onColorChange).toHaveBeenCalledWith("#ff0000");
  });

  it("updates color via Hex input field", () => {
    render(<ColorPicker onColorChange={onColorChange} />);
    fireEvent.click(screen.getByTitle(/change color/i));

    const hexInput = screen.getByDisplayValue("#000000"); // initial value
    fireEvent.blur(hexInput, { target: { value: "#00ff00" } });

    expect(onColorChange).toHaveBeenCalledWith("#00ff00");
  });

  it("adds color to history on change", () => {
    render(<ColorPicker onColorChange={onColorChange} />);
    fireEvent.click(screen.getByTitle(/change color/i));

    const rgbInput = screen.getByPlaceholderText(/rgb\(r, g, b\)/i);
    fireEvent.blur(rgbInput, { target: { value: "rgb(100, 100, 100)" } });

    // Should now show 1 history swatch with the color #646464
    const swatches = screen.getAllByTitle("#646464");
    expect(swatches.length).toBe(1);
  });

  it("closes color picker when clicking outside", () => {
    render(
      <div>
        <ColorPicker onColorChange={onColorChange} />
        <div data-testid="outside">Outside Element</div>
      </div>
    );

    fireEvent.click(screen.getByTitle(/change color/i));
    expect(screen.getByText(/hex:/i)).toBeInTheDocument();

    fireEvent.mouseDown(screen.getByTestId("outside"));
    expect(screen.queryByText(/hex:/i)).not.toBeInTheDocument();
  });
});
