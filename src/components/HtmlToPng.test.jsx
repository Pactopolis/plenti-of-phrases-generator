// src/components/HtmlToPng.test.jsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach, vi } from "vitest";
import HtmlToPng from "./HtmlToPng";
import html2canvas from "html2canvas";
import { saveAs } from "file-saver";

vi.mock("html2canvas");

vi.mock("file-saver", () => ({
  saveAs: vi.fn(),
}));

describe("HtmlToPng Component", () => {
  const mockContent = "Resize PNG";
  const placeholderContent = "This is !{word} text.";
  const mockWords = ["alpha", "beta"];
  const mockedImage = "mock-data-url";

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(html2canvas).mockResolvedValue({
      toDataURL: vi.fn().mockReturnValue(mockedImage),
      toBlob: vi.fn().mockImplementation((cb) => {
        cb(new Blob(["mock image"], { type: "image/png" }));
      }),
    });

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
          toBlob: vi.fn().mockImplementation((cb) => {
            cb(new Blob(["mock image"], { type: "image/png" }));
          }),
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
    expect(screen.getByText("Resize")).toBeInTheDocument();
    expect(screen.getByText("PNG")).toBeInTheDocument();
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

    render(<HtmlToPng content={placeholderContent} wordList={mockWords} />);

    const downloadButton = screen.getByRole("button", {
      name: /download as zip/i,
    });
    await user.click(downloadButton);

    await waitFor(() => {
      expect(html2canvas).toHaveBeenCalledTimes(mockWords.length);
      expect(saveAs).toHaveBeenCalled();
    });
  });
});
