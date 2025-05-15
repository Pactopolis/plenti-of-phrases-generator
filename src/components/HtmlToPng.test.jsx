import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach, vi } from "vitest";
import HtmlToPng from "./HtmlToPng";
import html2canvas from "html2canvas";

// Mock html2canvas
vi.mock("html2canvas");

describe("HtmlToPng Component", () => {
  const mockContent = "Test Content";

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();

    // Mock the html2canvas implementation
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

    // Mock link click
    const mockClick = vi.fn();
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(
      mockClick
    );

    render(<HtmlToPng content={mockContent} />);

    // Verify resize hint is present
    expect(
      screen.getByText(/drag the bottom-right corner to resize/i)
    ).toBeInTheDocument();

    // Get the resizable container
    const container = screen.getByText("Content").closest(".content-container");
    expect(container).toHaveStyle({
      resize: "both",
      overflow: "auto",
    });

    // Simulate resizing by updating the container's dimensions
    Object.defineProperties(container, {
      offsetWidth: { configurable: true, value: 600 },
      offsetHeight: { configurable: true, value: 400 },
    });

    // Trigger resize event
    fireEvent.resize(container);

    // Set up spy before the download action
    const createElementSpy = vi.spyOn(document, "createElement");

    // Click download button after resize
    const downloadButton = screen.getByRole("button", {
      name: /download as png/i,
    });
    await user.click(downloadButton);

    // Verify html2canvas was called with the resized container
    expect(html2canvas).toHaveBeenCalledWith(
      container,
      expect.objectContaining({
        backgroundColor: "white",
        scale: 2,
        useCORS: true,
        allowTaint: true,
      })
    );

    // Verify link creation and click
    expect(createElementSpy).toHaveBeenCalledWith("a");
    expect(mockClick).toHaveBeenCalled();

    // Clean up
    createElementSpy.mockRestore();
    vi.restoreAllMocks();
  });

  it("splits string content into individually rendered words", () => {
    render(<HtmlToPng content="One Two Three" />);

    // Confirm all words appear as separate elements
    expect(screen.getByText("One")).toBeInTheDocument();
    expect(screen.getByText("Two")).toBeInTheDocument();
    expect(screen.getByText("Three")).toBeInTheDocument();

    // Optional: Check number of spans rendered
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
      await user.click(el); // should not throw
    }
  });
});
