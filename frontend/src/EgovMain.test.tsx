import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it } from "vitest";
import Main from "@/pages/main/Main";

describe("Main Component", () => {
  it("renders correctly", () => {
    render(
      <MemoryRouter>
        <Main />
      </MemoryRouter>
    );
  });
});
