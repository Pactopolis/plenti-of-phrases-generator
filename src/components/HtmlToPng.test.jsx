import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach, vi } from "vitest";
import HtmlToPng from "./HtmlToPng";
import html2canvas from "html2canvas";

// Mock html2canvas
vi.mock("html2canvas");

describe("HtmlToPng Component", () => {
  const mockContent = "Resize PNG";
  const placeholderContent = "This is !{word} text.";
  const mockWords = ["alpha", "beta"];
  const mockedImage = "mock-data-url";

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(html2canvas).mockResolvedValue({
      toDataURL: vi.fn().mockReturnValue(mockedImage),
    });

    // Full mock of createElement
    vi.spyOn(document, "createElement").mockImplementation((tag) => {
      if (tag === "a") {
        return {
          href: "",
          download: "",
          click: vi.fn(),
        };
      } else if (tag === "canvas") {
        return {
          getContext: vi.fn().mockReturnValue({
            drawImage: vi.fn(),
          }),
          toDataURL: vi.fn().mockReturnValue(mockedImage),
          width: 500,
          height: 300,
        };
      }
      return document.__proto__.createElement.call(document, tag);
    });

    global.ResizeObserver = class {
      observe() {}
      disconnect() {}
    };
  });

  it("renders the provided content", () => {
    render(<HtmlToPng content={mockContent} />);
    expect(screen.getByText(/resize png/i)).toBeInTheDocument();
  });

  it("renders a download button", () => {
    render(<HtmlToPng content={mockContent} />);
    const button = screen.getByRole("button", { name: /download as png/i });
    expect(button).toBeInTheDocument();
  });

  it("supports resizing and PNG creation after resize", async () => {
    const user = userEvent.setup();

    render(<HtmlToPng content={mockContent} />);

    const downloadButton = screen.getByRole("button", {
      name: /download as png/i,
    });
    await user.click(downloadButton);

    await waitFor(() => {
      expect(html2canvas).toHaveBeenCalledTimes(1);
    });
  });

  it("generates a zip with one image per word when !{word} is present", async () => {
    const user = userEvent.setup();
    const createObjectURLMock = vi.fn().mockReturnValue("blob-url");
    const clickMock = vi.fn();

    global.URL.createObjectURL = createObjectURLMock;

    const mockAnchor = { href: "", download: "", click: clickMock };
    vi.spyOn(document, "createElement").mockImplementation((tag) => {
      if (tag === "a") return mockAnchor;
      if (tag === "canvas") {
        return {
          getContext: vi.fn().mockReturnValue({ drawImage: vi.fn() }),
          toDataURL: vi.fn().mockReturnValue(mockedImage),
          width: 500,
          height: 300,
        };
      }
      return document.__proto__.createElement.call(document, tag);
    });

    render(<HtmlToPng content={placeholderContent} words={mockWords} />);
    const downloadButton = screen.getByRole("button", {
      name: /download as png/i,
    });
    await user.click(downloadButton);

    await waitFor(() => {
      expect(html2canvas).toHaveBeenCalledTimes(mockWords.length);
      expect(createObjectURLMock).toHaveBeenCalled();
      expect(clickMock).toHaveBeenCalled();
    });
  });
});
