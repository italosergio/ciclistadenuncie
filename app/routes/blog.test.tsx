import { describe, it, expect, vi, beforeAll } from "vitest";
import { render, screen } from "@testing-library/react";
import Blog from "./blog";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  initReactI18next: { type: "3rdParty", init: vi.fn() },
}));

beforeAll(() => {
  localStorage.clear();
});

describe("Blog", () => {
  it("deve renderizar o título do post", () => {
    render(<Blog />);
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    expect(screen.getByText("blog.post1.title")).toBeInTheDocument();
  });

  it("deve renderizar o texto introdutório", () => {
    render(<Blog />);
    expect(screen.getByText("blog.post1.intro")).toBeInTheDocument();
  });

  it("deve renderizar os 6 parágrafos do post", () => {
    render(<Blog />);
    for (let i = 1; i <= 6; i++) {
      expect(screen.getByText(`blog.post1.p${i}`)).toBeInTheDocument();
    }
  });

  it("deve renderizar o link de volta para home com href correto", () => {
    render(<Blog />);
    const link = screen.getByText("backToHome");
    expect(link).toBeInTheDocument();
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("href", "/");
  });
});
