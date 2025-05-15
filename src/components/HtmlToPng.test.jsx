import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach, vi } from "vitest";
import HtmlToPng from "./HtmlToPng";
import html2canvas from "html2canvas";

// Mock html2canvas
vi.mock("html2canvas");

describe("HtmlToPng Component", () => {
  const mockContent = <div>Test Content</div>;

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
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("renders a download button", () => {
    render(<HtmlToPng content={mockContent} />);
    const downloadButton = screen.getByRole("button", {
      name: /download as png/i,
    });
    expect(downloadButton).toBeInTheDocument();
  });

  it("applies correct styling to the content container", () => {
    render(<HtmlToPng content={mockContent} />);
    const container = screen
      .getByText("Test Content")
      .closest(".content-container");

    // Check inline styles directly
    expect(container.style.padding).toBe("20px");
    expect(container.style.background).toBe("white");
    expect(container.style.border).toBe("1px solid rgb(204, 204, 204)");
    expect(container.style.borderRadius).toBe("8px");
  });
});
