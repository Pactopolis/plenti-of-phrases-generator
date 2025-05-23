import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import WordsUpload from "./WordsUpload";
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock CSS module with default export
vi.mock("./WordsUpload.module.css", () => ({
  default: {
    container: "mock-container",
    button: "mock-button",
  },
}));

describe("WordsUpload Component", () => {
  let mockOnWordListChange;

  beforeEach(() => {
    mockOnWordListChange = vi.fn();
  });

  it("renders the upload button", () => {
    render(<WordsUpload onWordListChange={mockOnWordListChange} />);
    expect(
      screen.getByRole("button", { name: /upload word list/i })
    ).toBeInTheDocument();
  });

  it("calls input click when upload button is clicked", async () => {
    const { container } = render(
      <WordsUpload onWordListChange={mockOnWordListChange} />
    );
    const input = container.querySelector('input[type="file"]');
    const clickSpy = vi.spyOn(input, "click");

    await userEvent.click(screen.getByRole("button"));
    expect(clickSpy).toHaveBeenCalled();
  });

  it("parses valid .words file and calls onWordListChange", async () => {
    const fileContent = "alpha, beta , gamma";
    const file = new File([fileContent], "test.words", { type: "text/plain" });

    const { container } = render(
      <WordsUpload onWordListChange={mockOnWordListChange} />
    );
    const input = container.querySelector('input[type="file"]');

    await fireEvent.change(input, {
      target: { files: [file] },
    });

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(mockOnWordListChange).toHaveBeenCalledWith([
      "alpha",
      "beta",
      "gamma",
    ]);
  });

  it("shows alert for invalid file extension", async () => {
    const alertMock = vi.spyOn(window, "alert").mockImplementation(() => {});
    const file = new File(["invalid"], "badfile.txt", { type: "text/plain" });

    const { container } = render(
      <WordsUpload onWordListChange={mockOnWordListChange} />
    );
    const input = container.querySelector('input[type="file"]');

    await fireEvent.change(input, {
      target: { files: [file] },
    });

    expect(alertMock).toHaveBeenCalledWith("Please select a .words file");
    alertMock.mockRestore();
  });
});
