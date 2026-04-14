import { render, screen } from "@testing-library/react";
import App from "./App";

beforeEach(() => {
  global.fetch = jest.fn((url) => {
    if (url.includes("/meta/applicants")) {
      return Promise.resolve({ ok: true, json: async () => ["Alice Johnson"] });
    }
    if (url.includes("/meta/departments")) {
      return Promise.resolve({ ok: true, json: async () => ["Computer Science"] });
    }
    if (url.includes("/meta/projects")) {
      return Promise.resolve({ ok: true, json: async () => ["AI-Driven Climate Modeling"] });
    }
    return Promise.resolve({ ok: true, json: async () => [] });
  });
});

afterEach(() => {
  jest.resetAllMocks();
});

test("renders the application form", async () => {
  render(<App />);

  expect(await screen.findByRole("heading", { name: /New Application/i })).toBeInTheDocument();
  expect(screen.getByText(/Submit for AI Review/i)).toBeInTheDocument();
  expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
});
