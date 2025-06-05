import { render, screen } from "@testing-library/react";
import Palette from "./Palette";
import { describe, it, expect } from "vitest";
import { Provider } from "react-redux";
import store from "../workspace/workspaceStore";

describe("Palette", () => {
    it("renders palette items and trash container", () => {
        render(<Provider store={store}><Palette /></Provider>);
        // Check for palette item
        expect(screen.getByTestId("palette-item-note")).toBeInTheDocument();
        // Check for trash container
        expect(screen.getByTestId("trash")).toBeInTheDocument();
    });
});
