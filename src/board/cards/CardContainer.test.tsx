import { render, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import type { CardData, ColumnContent } from "../../shared/workspaceTypes";
import { Provider } from "react-redux";
import { setupStore } from "../workspace/workspaceStore";
import Workspace from "../workspace/Workspace";

const DummyComponent = () => <div>Dummy</div>;

describe("CardContainer", () => {
    it("adds the 'selected' class when clicked", () => {
        const cardData: CardData = {
            id: "1",
            type: "note",
            width: 100,
            height: 100,
            zIndex: 1,
            top: 0,
            left: 0,
        };
        const store = setupStore({ workspace: { cards: { "1": cardData }, id: "foo", description: "", currentMaxZIndex: 1 } });
        const { getByTestId } = render(
            <Provider store={store}>
                <Workspace />
            </Provider>
        );
        const card = getByTestId("card-1");

        fireEvent.click(card);
        expect(card).toHaveClass("selected");
    });

    it("adds the 'selected' class to child components when clicked", () => {
        const cardData: CardData = {
            id: "1",
            type: "note",
            width: 100,
            height: 100,
            zIndex: 1,
            top: 0,
            left: 0,
            parent: "2"
        };

        const column: CardData = {
            id: "2",
            type: "column",
            width: 100,
            height: 100,
            zIndex: 1,
            top: 0,
            left: 0,
            content: { title: "Column", children: ["1"] } as ColumnContent
        };
        const store = setupStore({ 
            workspace: { 
                cards: { "1": cardData, "2": column }, 
                id: "foo", 
                description: "", 
                currentMaxZIndex: 1 
            } 
        });
        const { getByTestId } = render(
            <Provider store={store}>
                <Workspace />
            </Provider>
        );
        const card = getByTestId("card-1");

        fireEvent.click(card);
        expect(card).toHaveClass("selected");
    });
});