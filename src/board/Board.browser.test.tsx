import { render } from "vitest-browser-react";
import { Provider } from "react-redux";
import Board from "./Board";
import { setupStore } from "./workspace/workspaceStore";
import { describe, it, expect } from "vitest";
import { page, userEvent } from '@vitest/browser/context'

describe("Board", () => {
    it("renders Workspace and palette", () => {
        const customStore = setupStore({ workspace: {
            id: "foo",
            description: "",
            cards: {},
            currentMaxZIndex: 1
        }});
        const { container } = render(
            <Provider store={customStore}>
                <Board />
            </Provider>
        );

        const workspace = container.querySelector(".workspace-container");
        const palette = container.querySelector(".palette");
        expect(workspace).toBeTruthy();
        expect(palette).toBeTruthy();
    });

    it("supports drag and drop into workspace from palette when not near border", async () => {
        const customStore = setupStore({ workspace: {
                id: "foo",
                description: "",
                cards: {},
                currentMaxZIndex: 1
            }});
        const { container } = render(
            <Provider store={customStore}>
                <Board />
            </Provider>
        );

        const workspace = page.getByTestId("workspace");
        const notePalette = container.querySelector(".note-palette-item") as Element;
        const elem = page.elementLocator(notePalette);
        await userEvent.dragAndDrop(elem, workspace, { targetPosition: { x: 100, y: 100 }});
        const droppedItem = container.querySelector(".card-container") as Element;
        const styles = getComputedStyle(droppedItem);
        expect(styles.width).toBe("240px");
        expect(styles.height).toBe("144px");
    });

    it("supports drag and drop into workspace from palette when near border", async () => {
        const customStore = setupStore({ workspace: {
                id: "foo",
                description: "",
                cards: {},
                currentMaxZIndex: 1
            }});
        const { container } = render(
            <Provider store={customStore}>
                <Board />
            </Provider>
        );

        const workspace = page.getByTestId("workspace");
        const notePalette = container.querySelector(".note-palette-item") as Element;
        const elem = page.elementLocator(notePalette);
        await userEvent.dragAndDrop(elem, workspace, { targetPosition: { x: 10, y: 1 }});
        const droppedItem = container.querySelector(".card-container") as Element;
        const styles = getComputedStyle(droppedItem);
        expect(styles.left).toBe("0px");
        expect(styles.top).toBe("0px");
    });

    it("supports drag and drop of existing items to place not near border", async () => {
        
        const customStore = setupStore({ 
            workspace: {
                id: "foo",
                description: "",
                cards: {
                    "100": {
                        id:"100",
                        top: 200,
                        left: 200,
                        zIndex: 1,
                        content: null,
                        type: "note",
                        width: 30,
                        height: 40
                    }
                },
                currentMaxZIndex: 1
            }});
        const { container } = render(
            <Provider store={customStore}>
                <Board />
            </Provider>
        );

        const workspace = page.getByTestId("workspace");
        const droppedItem = container.querySelector(".card-container") as HTMLDivElement;
        const droppedElem = page.elementLocator(droppedItem);
        expect(droppedItem.offsetTop).toBe(200);
        expect(droppedItem.offsetLeft).toBe(200);
        await userEvent.dragAndDrop(droppedElem, workspace, { targetPosition: { x: 300, y: 300 }});
        expect(Math.ceil(droppedItem.offsetTop))
            .toBe(Math.ceil(customStore.getState().workspace.cards["100"].top!));
        expect(Math.ceil(droppedItem.offsetLeft))
            .toBe(Math.ceil(customStore.getState().workspace.cards["100"].left!));
    });

    it("supports drag and drop of existing items to place past border of workspace", async () => {
        
        const customStore = setupStore({ 
            workspace: {
                id: "foo",
                description: "",
                cards: {
                    "100": {
                        id:"100",
                        top: 0,
                        left: 0,
                        zIndex: 1,
                        content: null,
                        type: "note",
                        width: 200,
                        height: 300
                    }
                },
                currentMaxZIndex: 1
            }});
        const { container } = render(
            <Provider store={customStore}>
                <Board />
            </Provider>
        );

        const workspace = page.getByTestId("workspace");
        const droppedItem = container.querySelector(".card-container") as HTMLDivElement;
        const droppedElem = page.elementLocator(droppedItem);
        await userEvent.dragAndDrop(droppedElem, workspace, { targetPosition: { x: 100, y: 1 }});
        expect(droppedItem.offsetTop).toBe(0);
        expect(droppedItem.offsetLeft).toBe(0);
    });

    it("supports deleting existing items", async () => {
        const customStore = setupStore({ 
            workspace: {
                id: "foo",
                description: "",
                cards: {
                    "100": {
                        id:"100",
                        top: 0,
                        left: 0,
                        zIndex: 1,
                        content: null,
                        type: "note",
                        width: 30,
                        height: 40
                    }
                },
                currentMaxZIndex: 1
            }});
        const { container } = render(
            <Provider store={customStore}>
                <Board />
            </Provider>
        );

        const trash = page.getByTestId("trash");
        const droppedItem = container.querySelector(".card-container") as HTMLDivElement;
        const droppedElem = page.elementLocator(droppedItem);
        expect(customStore.getState().workspace.cards["100"]).toBeDefined();
        await userEvent.dragAndDrop(droppedElem, trash);
        expect(customStore.getState().workspace.cards["100"]).toBeUndefined();
    });

    it("drag and drop into trash does nothing", async () => {
        const customStore = setupStore({ workspace: {
                id: "foo",
                description: "",
                cards: {},
                currentMaxZIndex: 1
            }});
        const { container } = render(
            <Provider store={customStore}>
                <Board />
            </Provider>
        );

        const trash = page.getByTestId("trash");
        const notePalette = container.querySelector(".note-palette-item") as Element;
        const elem = page.elementLocator(notePalette);
        await userEvent.dragAndDrop(elem, trash);
        expect(Object.keys(customStore.getState().workspace.cards).length).toBe(0);
    });
});