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

  const styleYaml = `
type: regex
pattern: '\\b\\w+\\b'
style:
  color: red
`;

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
    render(<HtmlToPng content={mockContent} styleYaml={styleYaml} />);
    expect(
      screen.getByText((text) => text.includes("Resize"))
    ).toBeInTheDocument();
    expect(screen.getByText("PNG")).toBeInTheDocument();
  });

  it("renders a download button", () => {
    render(<HtmlToPng content={mockContent} styleYaml={styleYaml} />);
    const button = screen.getByRole("button", { name: /download as png/i });
    expect(button).toBeInTheDocument();
  });

  it("applies the default font family when none is provided", () => {
    render(<HtmlToPng content={mockContent} />);
    const spanElement = screen.getByText((text) => text.includes("Resize"));
    expect(spanElement).toHaveStyle({ fontFamily: "Arial" });
  });

  it("applies the provided font family", () => {
    const customFont = "Times New Roman";
    render(
      <HtmlToPng
        content={mockContent}
        fontFamily={customFont}
        styleYaml={styleYaml}
      />
    );
    const spanElement = screen.getByText((text) => text.includes("Resize"));
    expect(spanElement).toHaveStyle({ fontFamily: customFont });
  });

  it("maintains font family when generating multiple images", async () => {
    const customFont = "Georgia";
    const user = userEvent.setup();

    render(
      <HtmlToPng
        content={placeholderContent}
        wordList={mockWords}
        fontFamily={customFont}
        styleYaml={styleYaml}
      />
    );

    const downloadButton = screen.getByRole("button", {
      name: /download as zip/i,
    });
    await user.click(downloadButton);

    await waitFor(() => {
      expect(html2canvas).toHaveBeenCalledTimes(mockWords.length);
      expect(saveAs).toHaveBeenCalled();
    });

    const spanElement = screen.getByText((text) => text.includes("This"));
    expect(spanElement).toHaveStyle({ fontFamily: customFont });
  });

  it("supports resizing and PNG creation after resize", async () => {
    const user = userEvent.setup();

    render(<HtmlToPng content={mockContent} styleYaml={styleYaml} />);
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

    render(
      <HtmlToPng
        content={placeholderContent}
        wordList={mockWords}
        styleYaml={styleYaml}
      />
    );

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

describe("HtmlToPng YAML styling", () => {
  const styledContent = "I was running and eating.";
  const styleYaml = `
type: regex
pattern: '\\b\\w+ing\\b'
style:
  color: purple
  fontWeight: bold
`;

  it("applies styles from valid YAML to matching words", () => {
    render(<HtmlToPng content={styledContent} styleYaml={styleYaml} />);

    const spans = screen.getAllByText((content, node) => {
      return node?.tagName === "SPAN" && content.match(/^running$|^eating.?$/);
    });

    const runningSpan = spans.find((el) => el.textContent === "running");
    const eatingSpan = spans.find((el) => el.textContent?.startsWith("eating"));

    expect(runningSpan).toBeTruthy();
    expect(eatingSpan).toBeTruthy();

    const runningStyles = getComputedStyle(runningSpan);
    expect(runningStyles.color).toBe("rgb(128, 0, 128)");
    expect(runningStyles.fontWeight).toMatch(/bold|700/i);
  });

  it("gracefully falls back when given invalid YAML", () => {
    const invalidYaml = `
  type: regex
  pattern:
  style:
  `;

    render(<HtmlToPng content={styledContent} styleYaml={invalidYaml} />);

    const fallbackSpan = screen.getByText(styledContent);
    expect(fallbackSpan).toBeInTheDocument();
  });

  it("renders unstyled spans if no styleYaml is provided", () => {
    render(<HtmlToPng content={styledContent} />);
    const spans = screen.getAllByText(
      (text, node) => node?.tagName === "SPAN" && /running|eating/.test(text)
    );
    expect(spans.length).toBeGreaterThanOrEqual(2);
  });

  it("YAML styles override component props while non-matching spans use props", () => {
    const content = "I am highlighting this word.";
    const yaml = `
  type: regex
  pattern: '\\bhighlighting\\b'
  style:
    color: red
    fontWeight: bold
  `;

    render(
      <HtmlToPng
        content={content}
        textColor="green"
        fontWeight={100}
        styleYaml={yaml}
      />
    );

    const highlighted = screen.getByText("highlighting");
    const highlightedStyle = getComputedStyle(highlighted);
    expect(highlightedStyle.color).toBe("rgb(255, 0, 0)");
    expect(highlightedStyle.fontWeight).toMatch(/bold|700/i);

    const otherWords = ["I", "am", "this", "word."];
    for (const word of otherWords) {
      const el = screen.getByText(word);
      const style = getComputedStyle(el);
      expect(style.color).toBe("rgb(0, 128, 0)");
      expect(style.fontWeight).toBe("100");
    }
  });
});
