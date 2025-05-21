import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach, vi } from "vitest";
import HtmlToPng from "./HtmlToPng";
import html2canvas from "html2canvas";

// Mock html2canvas
vi.mock("html2canvas");

describe("HtmlToPng Component", () => {
  const mockContent = "Test Content";

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(html2canvas).mockResolvedValue({
      toDataURL: vi.fn().mockReturnValue("mock-data-url"),
    });
  });

  it("renders the provided content", () => {
    render(<HtmlToPng content={mockContent} />);
    expect(screen.getByText("Test")).toBeInTheDocument();
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("renders a download button", () => {
    render(<HtmlToPng content={mockContent} />);
    const downloadButton = screen.getByRole("button", {
      name: /download as png/i,
    });
    expect(downloadButton).toBeInTheDocument();
  });

  it("supports resizing and PNG creation after resize", async () => {
    const user = userEvent.setup();

    const mockClick = vi.fn();
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(
      mockClick
    );

    render(<HtmlToPng content={mockContent} />);

    expect(
      screen.getByText(/drag the bottom-right corner to resize/i)
    ).toBeInTheDocument();

    const container = screen.getByText("Content").closest(".content-container");
    expect(container).toHaveStyle({
      resize: "both",
      overflow: "auto",
    });

    Object.defineProperties(container, {
      offsetWidth: { configurable: true, value: 600 },
      offsetHeight: { configurable: true, value: 400 },
    });

    fireEvent.resize(container);

    const createElementSpy = vi.spyOn(document, "createElement");

    const downloadButton = screen.getByRole("button", {
      name: /download as png/i,
    });
    await user.click(downloadButton);

    expect(html2canvas).toHaveBeenCalledWith(
      container,
      expect.objectContaining({
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        allowTaint: true,
      })
    );

    expect(createElementSpy).toHaveBeenCalledWith("a");
    expect(mockClick).toHaveBeenCalled();

    createElementSpy.mockRestore();
    vi.restoreAllMocks();
  });

  it("temporarily sets transparent background and no border for PNG generation", async () => {
    const user = userEvent.setup();

    // Create a mock canvas promise we can resolve manually
    let resolveCanvas;
    const canvasPromise = new Promise((resolve) => {
      resolveCanvas = () =>
        resolve({
          toDataURL: () => "mock-data-url",
        });
    });

    // Use the manually controlled promise in the mock
    html2canvas.mockReturnValue(canvasPromise);

    render(<HtmlToPng content="Temporary Styles Test" />);

    const downloadButton = screen.getByRole("button", {
      name: /download as png/i,
    });

    const contentDiv = document.querySelector(".content-container");

    // Set initial inline styles for accurate restoration check
    contentDiv.style.background = "white";
    contentDiv.style.border = "1px solid rgba(0, 0, 0, 0.1)";

    // trigger download
    await user.click(downloadButton);

    // check temporary styles before resolving canvas
    const tempStyle = getComputedStyle(contentDiv);
    expect(tempStyle.backgroundColor).toBe("rgba(0, 0, 0, 0)");
    expect(tempStyle.border).toBe("");

    resolveCanvas();

    // check restored styles after PNG generation finishes
    await waitFor(() => {
      const restored = getComputedStyle(contentDiv);
      expect(restored.backgroundColor).toBe("rgb(255, 255, 255)");
      expect(restored.border).toBe("1px solid rgba(0, 0, 0, 0.1)");
    });
  });

  it("splits string content into individually rendered words", () => {
    render(<HtmlToPng content="One Two Three" />);
    expect(screen.getByText("One")).toBeInTheDocument();
    expect(screen.getByText("Two")).toBeInTheDocument();
    expect(screen.getByText("Three")).toBeInTheDocument();

    const spans = screen.getAllByText(/(One|Two|Three)/);
    expect(spans).toHaveLength(3);
  });

  it("renders each word as a clickable element", async () => {
    const user = userEvent.setup();
    const content = "Words should be clickable";

    render(<HtmlToPng content={content} />);

    const words = content.split(" ");
    for (const word of words) {
      const el = screen.getByText(word);
      expect(el).toBeInTheDocument();
      await user.click(el); // ensure clickable
    }
  });

  it("applies custom text color when textColor prop is set", () => {
    render(<HtmlToPng content="Color Check" textColor="#ff0000" />);
    const word = screen.getByText("Color");
    expect(word).toHaveStyle("color: #ff0000");
  });

  it("defaults to black text color if no textColor prop is provided", () => {
    render(<HtmlToPng content="Default Color" />);
    const word = screen.getByText("Default");
    expect(word).toHaveStyle("color: rgb(0, 0, 0)");
  });
});
