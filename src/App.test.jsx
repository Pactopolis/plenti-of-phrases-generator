import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

describe("App Component", () => {
  it('renders the main heading "HTML to PNG Converter"', () => {
    render(<App />);
    const heading = screen.getByRole("heading", {
      name: /HTML to PNG Converter/i,
    });
    expect(heading).toBeInTheDocument();
  });

  it("renders the Lorem Ipsum text content", () => {
    render(<App />);
    const loremText = screen.getByText(/Lorem ipsum dolor sit amet/i);
    expect(loremText).toBeInTheDocument();
    expect(loremText.tagName.toLowerCase()).toBe("p");
  });

  it("renders the HtmlToPng component", () => {
    const { container, debug } = render(<App />);

    // Debug the rendered output
    debug();

    // Look for the button by its exact text content
    const downloadButton = screen.getByText("Download as PNG");
    expect(downloadButton).toBeInTheDocument();

    // Look for the content container that holds the Lorem Ipsum text
    const contentContainer = screen
      .getByText(/Lorem ipsum dolor sit amet/i)
      .closest(".content-container");
    expect(contentContainer).toBeInTheDocument();
  });

  it("applies correct styling to the Lorem Ipsum text", () => {
    render(<App />);
    const loremText = screen.getByText(/Lorem ipsum dolor sit amet/i);

    // Check inline styles directly
    expect(loremText.style.fontSize).toBe("20px");
    expect(loremText.style.color).toBe("black");
  });
});
