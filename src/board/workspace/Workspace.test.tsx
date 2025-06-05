import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { describe, it, expect } from 'vitest'
import { setupStore } from "./workspaceStore.ts";
import Workspace from "./Workspace.tsx";


describe("Workspace", () => {
    it("does not render any cards when workspace.cards is empty", () => {
        const store = setupStore({ workspace: {
                id: "foo",
                description: "",
                cards: {},
                currentMaxZIndex: 1
            }});
        const { container } = render(
            <Provider store={store}>
                <Workspace />
            </Provider>
        );

        // There should be no elements with the class 'base-card'
        expect(container.querySelectorAll(".base-card").length).toBe(0);
    });

    it("renders card when specifies", () => {
        const store = setupStore({ workspace: {
                id: "foo",
                description: "",
                cards: {foo: {
                    id: "foo",
                    width: 10,
                    height: 40,
                    top: 10,
                    left: 12,
                    zIndex: 1,
                    type: "note"
                }},
                currentMaxZIndex: 1
            }});
        const { container } = render(
            <Provider store={store}>
                <Workspace />
            </Provider>
        );

        // There should be no elements with the class 'base-card'
        expect(container.querySelectorAll(".base-card").length).toBe(1);
        const notes = container.querySelectorAll(".note");
        expect(notes.length).toBe(1);
        // @ts-ignore
        expect(store.getState().workspace.cards.foo.id).toBe("foo");
        const computedStyles = getComputedStyle(notes[0]);
        expect(computedStyles.width).toBe("10px");
        expect(computedStyles.height).toBe("40px");
        expect(computedStyles.top).toBe("10px");
        expect(computedStyles.left).toBe("12px");
        expect(computedStyles.zIndex).toBe("1");
    });
});