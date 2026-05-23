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
  it("deve renderizar o título da página", () => {
    render(<Blog />);
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    expect(screen.getByText((content) => content.includes("blog.title"))).toBeInTheDocument();
  });

  it("deve renderizar o parágrafo de 'em breve'", () => {
    render(<Blog />);
    expect(screen.getByText("blog.comingSoon")).toBeInTheDocument();
  });

  it("deve renderizar o link de volta para home com href correto", () => {
    render(<Blog />);
    const link = screen.getByText("backToHome");
    expect(link).toBeInTheDocument();
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("href", "/");
  });
});
