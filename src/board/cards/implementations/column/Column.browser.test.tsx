import { render } from "vitest-browser-react";
import { Provider } from "react-redux";
import Board from "../../../Board";
import { setupStore } from "../../../workspace/workspaceStore";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { page, userEvent, type Locator } from '@vitest/browser/context';
import type { ColumnContent, HasChildrenIds, ID } from "../../../../shared/workspaceTypes";
import { commands } from '@vitest/browser/context'

describe("Column", () => {
    beforeEach(() => {
        page.viewport(1000, 1000);
    });
    it("add a column and ensure that there is a single item", async () => {
        const customStore = setupStore({
            workspace: {
                id: "foo",
                description: "",
                cards: {},
                currentMaxZIndex: 1
            }
        });
        const { container } = render(
            <Provider store={customStore}>
                <Board />
            </Provider>
        );

        const workspace = page.getByTestId("workspace");
        const notePalette = container.querySelector(".column-palette-item") as Element;
        const elem = page.elementLocator(notePalette);
        await userEvent.dragAndDrop(elem, workspace, { targetPosition: { x: 100, y: 100 } });
        const droppedItems = workspace.elements();
        expect(droppedItems.length).toBe(1);
    });

    it("column includes heading", async () => {
        const customStore = setupStore({
            workspace: {
                id: "foo",
                description: "",
                cards: {
                },
                currentMaxZIndex: 1
            }
        });
        const { container } = render(
            <Provider store={customStore}>
                <Board />
            </Provider>
        );

        const workspace = page.getByTestId("workspace");
        const notePalette = container.querySelector(".column-palette-item") as Element;
        const elem = page.elementLocator(notePalette);
        await userEvent.dragAndDrop(elem, workspace, { targetPosition: { x: 100, y: 100 } });
        const droppedItems = workspace.elements();
        const columnCard = droppedItems[0] as HTMLDivElement;
        const heading = columnCard.querySelector("h2") as HTMLHeadingElement;
        expect(heading).toHaveTextContent("New Column");
    });

    it("column includes children cards", async () => {
        const customStore = setupStore({
            workspace: {
                id: "foo",
                description: "",
                cards: {
                    "100": {
                        id: "100",
                        top: 0,
                        left: 0,
                        zIndex: 1,
                        content: null,
                        type: "note",
                        width: 30,
                        height: 40,
                        parent: "300"
                    },
                    "200": {
                        id: "200",
                        top: 0,
                        left: 0,
                        zIndex: 1,
                        content: null,
                        type: "note",
                        width: 30,
                        height: 40,
                        parent: "300"
                    },
                    "300": {
                        id: "300",
                        top: 0,
                        left: 0,
                        zIndex: 1,
                        content: {
                            title: "heading",
                            children: ["100", "200"]
                        },
                        type: "column",
                        width: 30,
                        height: 40,
                    }
                },
                currentMaxZIndex: 1
            }
        });
        render(
            <Provider store={customStore}>
                <Board />
            </Provider>
        );

        const workspace = page.getByTestId("workspace");
        const droppedItems = workspace.elements();
        expect(droppedItems.length).toBe(1);
    });

    describe("column add children", () => {
        let container: HTMLElement;
        let customStore: ReturnType<typeof setupStore>;
        let workspace: Locator;
        let column: Locator;
        describe("from palette", () => {
            let notePalette: Element;
            const childrenOfColumn = ["100", "200"];
            beforeEach(() => {
                customStore = setupStore({
                    workspace: {
                        id: "foo",
                        description: "",
                        cards: {
                            "100": {
                                id: "100",
                                top: 0,
                                left: 0,
                                zIndex: 1,
                                content: null,
                                type: "note",
                                width: 30,
                                height: 40,
                                parent: "column"
                            },
                            "200": {
                                id: "200",
                                top: 0,
                                left: 0,
                                zIndex: 1,
                                content: null,
                                type: "note",
                                width: 30,
                                height: 40,
                                parent: "column"
                            },
                            "column": {
                                id: "column",
                                top: 0,
                                left: 0,
                                zIndex: 1,
                                content: {
                                    title: "heading",
                                    children: childrenOfColumn
                                },
                                type: "column",
                                width: 30,
                                height: 40,
                            }
                        },
                        currentMaxZIndex: 1
                    }
                });
                container = render(
                    <Provider store={customStore}>
                        <Board />
                    </Provider>
                ).container;
                workspace = page.getByTestId("workspace");
                notePalette = container.querySelector(".note-palette-item") as Element;
                column = workspace.getByTestId("card-column")
            });
            it("to top of column", async () => {
                await userEvent.dragAndDrop(page.elementLocator(notePalette), column, { targetPosition: { x: 1, y: 1 } });

                const childCards = column.getChildCards();
                const childrenOfColumnAfterChange = (customStore.getState().workspace.cards["column"].content as HasChildrenIds).children;
                const indexOfNewItem = childrenOfColumnAfterChange.findIndex((cardIds: ID) => !childrenOfColumn.includes(cardIds));
                const newCardId = childrenOfColumnAfterChange[indexOfNewItem];
                expect(indexOfNewItem).toBe(0);
                expect(childCards.elements()[indexOfNewItem].getAttribute(`data-testid`)).toBe(`card-${newCardId}`);
            });

            it("to bottom of column", async () => {
                const columnRects = (column.element() as HTMLElement).getClientRects();
                await userEvent.dragAndDrop(
                    page.elementLocator(notePalette),
                    column,
                    { targetPosition: { x: columnRects[0].width - 2, y: columnRects[0].height - 2 } });

                const childCards = column.getChildCards();
                const childrenOfColumnAfterChange = (customStore.getState().workspace.cards["column"].content as HasChildrenIds).children;
                const indexOfNewItem = childrenOfColumnAfterChange.findIndex((cardIds: ID) => !childrenOfColumn.includes(cardIds));
                const newCardId = childrenOfColumnAfterChange[indexOfNewItem];
                expect(indexOfNewItem).toBe(2);
                expect(childCards.elements()[indexOfNewItem].getAttribute(`data-testid`)).toBe(`card-${newCardId}`);
            });

            it("to top of existing child element", async () => {
                const dropElement = column.getChildCards().nth(1);
                await userEvent.dragAndDrop(
                    page.elementLocator(notePalette),
                    dropElement,
                    { targetPosition: { x: 0, y: 0 } });

                const childrenOfColumnAfterChange = (customStore.getState().workspace.cards["column"].content as HasChildrenIds).children;
                const indexOfNewItem = childrenOfColumnAfterChange.findIndex((cardIds: ID) => !childrenOfColumn.includes(cardIds));
                const newCardId = childrenOfColumnAfterChange[indexOfNewItem];
                expect(indexOfNewItem).toBe(2);
                expect(column.getChildCards().elements()[indexOfNewItem].getAttribute(`data-testid`)).toBe(`card-${newCardId}`);
            });

            it("to bottom of existing child element", async () => {
                const dropElement = column.getChildCards().nth(1);
                const dropElementRects = (dropElement.element() as HTMLElement).getClientRects();
                await userEvent.dragAndDrop(
                    page.elementLocator(notePalette),
                    dropElement,
                    { targetPosition: { x: dropElementRects[0].width - 2, y: dropElementRects[0].height - 2 } });

                const childrenOfColumnAfterChange = (customStore.getState().workspace.cards["column"].content as HasChildrenIds).children;
                const indexOfNewItem = childrenOfColumnAfterChange.findIndex((cardIds: ID) => !childrenOfColumn.includes(cardIds));
                const newCardId = childrenOfColumnAfterChange[indexOfNewItem];
                expect(indexOfNewItem).toBe(2);
                expect(column.getChildCards().elements()[indexOfNewItem].getAttribute(`data-testid`)).toBe(`card-${newCardId}`);
            });
        });

        describe("from card existing in workspace", () => {
            const childrenOfColumn = ["100", "200"];
            let cardInWorkspace: Locator;
            beforeEach(() => {
                customStore = setupStore({
                    workspace: {
                        id: "foo",
                        description: "",
                        cards: {
                            "100": {
                                id: "100",
                                top: 0,
                                left: 0,
                                zIndex: 1,
                                content: null,
                                type: "note",
                                width: 30,
                                height: 40,
                                parent: "column"
                            },
                            "200": {
                                id: "200",
                                top: 0,
                                left: 0,
                                zIndex: 1,
                                content: null,
                                type: "note",
                                width: 30,
                                height: 40,
                                parent: "column"
                            },
                            "300": {
                                id: "300",
                                top: 200,
                                left: 200,
                                zIndex: 1,
                                content: null,
                                type: "note",
                                width: 30,
                                height: 40,
                            },
                            "column": {
                                id: "column",
                                top: 0,
                                left: 0,
                                zIndex: 1,
                                content: {
                                    title: "heading",
                                    children: childrenOfColumn
                                },
                                type: "column",
                                width: 30,
                                height: 40,
                            }
                        },
                        currentMaxZIndex: 1
                    }
                });
                container = render(
                    <Provider store={customStore}>
                        <Board />
                    </Provider>
                ).container;
                workspace = page.getByTestId("workspace");
                column = workspace.getByTestId("card-column");
                cardInWorkspace = workspace.getByTestId("card-300");
            });
            it("to top of column", async () => {
                await userEvent.dragAndDrop(cardInWorkspace, column, { targetPosition: { x: 0, y: 0 } });

                const childCards = column.getChildCards();
                const childrenOfColumnAfterChange = (customStore.getState().workspace.cards["column"].content as HasChildrenIds).children;
                const indexOfMovedItem = childrenOfColumnAfterChange.findIndex((cardIds: ID) => cardIds === "300");
                expect(indexOfMovedItem).toBe(0);
                expect(childCards.elements()[indexOfMovedItem].getAttribute(`data-testid`)).toBe("card-300");
            });

            it("to bottom of column", async () => {
                const columnRects = (column.element() as HTMLElement).getClientRects();
                await userEvent.dragAndDrop(
                    cardInWorkspace,
                    column,
                    { targetPosition: { x: columnRects[0].width - 2, y: columnRects[0].height - 2 } });
                const childCards = column.getChildCards();
                const childrenOfColumnAfterChange = (customStore.getState().workspace.cards["column"].content as HasChildrenIds).children;
                const indexOfMovedItem = childrenOfColumnAfterChange.findIndex((cardIds: ID) => cardIds === "300");
                expect(indexOfMovedItem).toBe(2);
                expect(childCards.elements()[indexOfMovedItem].getAttribute(`data-testid`)).toBe("card-300");
            });

            it("to top of existing child element", async () => {
                const dropElement = column.getChildCards().nth(1);
                await userEvent.dragAndDrop(
                    cardInWorkspace,
                    dropElement,
                    { targetPosition: { x: 0, y: 0 } });
                const childCards = column.getChildCards();
                const childrenOfColumnAfterChange = (customStore.getState().workspace.cards["column"].content as HasChildrenIds).children;
                const indexOfMovedItem = childrenOfColumnAfterChange.findIndex((cardIds: ID) => cardIds === "300");
                expect(indexOfMovedItem).toBe(2);
                expect(childCards.elements()[indexOfMovedItem].getAttribute(`data-testid`)).toBe("card-300");
            });

            it("to bottom of existing child element", async () => {
                const dropElement = column.getChildCards().nth(1);
                const dropElementRects = (dropElement.element() as HTMLElement).getClientRects();
                await userEvent.dragAndDrop(
                    cardInWorkspace,
                    dropElement,
                    { targetPosition: { x: dropElementRects[0].width - 2, y: dropElementRects[0].height - 2 } });
                const childCards = column.getChildCards();
                const childrenOfColumnAfterChange = (customStore.getState().workspace.cards["column"].content as HasChildrenIds).children;
                const indexOfMovedItem = childrenOfColumnAfterChange.findIndex((cardIds: ID) => cardIds === "300");
                expect(indexOfMovedItem).toBe(2);
                expect(childCards.elements()[indexOfMovedItem].getAttribute(`data-testid`)).toBe("card-300");
            });
        });

        it("does not add column to column", async () => {
            const customStore = setupStore({
                workspace: {
                    id: "foo",
                    description: "",
                    cards: {
                        "100": {
                            id: "100",
                            top: 0,
                            left: 0,
                            zIndex: 1,
                            content: null,
                            type: "note",
                            width: 30,
                            height: 40,
                            parent: "column"
                        },
                        "200": {
                            id: "200",
                            top: 0,
                            left: 0,
                            zIndex: 1,
                            content: null,
                            type: "note",
                            width: 30,
                            height: 40,
                            parent: "column"
                        },
                        "300": {
                            id: "300",
                            top: 200,
                            left: 200,
                            zIndex: 1,
                            content: null,
                            type: "note",
                            width: 30,
                            height: 40,
                            parent: "columnToMoveTo"
                        },
                        "column": {
                            id: "column",
                            top: 0,
                            left: 0,
                            zIndex: 1,
                            content: {
                                title: "heading",
                                children: ["100", "200"]
                            },
                            type: "column",
                            width: 30,
                            height: 40,
                        },
                        "columnToMoveTo": {
                            id: "columnToMoveTo",
                            top: 0,
                            left: 300,
                            zIndex: 1,
                            content: {
                                title: "heading",
                                children: ["300"]
                            },
                            type: "column",
                            width: 400,
                            height: 400,
                        }
                    },
                    currentMaxZIndex: 1
                }
            });
            render(
                <Provider store={customStore}>
                    <Board />
                </Provider>
            );
            const workspace = page.getByTestId("workspace");
            const column = workspace.getByTestId("card-column");
            const columnToMoveTo = workspace.getByTestId("card-columnToMoveTo");

            await userEvent.dragAndDrop(column, columnToMoveTo, { sourcePosition: { x: 0, y: 0 }, targetPosition: { x: 0, y: 0 } });
            const childrenOfColumnAfterChange =
                (customStore.getState().workspace.cards["columnToMoveTo"].content as HasChildrenIds).children;
            expect(childrenOfColumnAfterChange).not.toContain("column");
        });

        describe("from card existing in column", () => {
            const childrenOfColumnOne = ["100", "200", "cardToMove"];
            let cardInColumnToMove: Locator;
            let columnToMoveTo: Locator;
            beforeEach(() => {
                customStore = setupStore({
                    workspace: {
                        id: "foo",
                        description: "",
                        cards: {
                            "100": {
                                id: "100",
                                top: 0,
                                left: 0,
                                zIndex: 1,
                                content: null,
                                type: "note",
                                width: 30,
                                height: 40,
                                parent: "column"
                            },
                            "200": {
                                id: "200",
                                top: 0,
                                left: 0,
                                zIndex: 1,
                                content: null,
                                type: "note",
                                width: 30,
                                height: 40,
                                parent: "column"
                            },
                            "cardToMove": {
                                id: "cardToMove",
                                top: 0,
                                left: 0,
                                zIndex: 1,
                                content: null,
                                type: "note",
                                width: 30,
                                height: 40,
                                parent: "column"
                            },
                            "300": {
                                id: "300",
                                top: 200,
                                left: 200,
                                zIndex: 1,
                                content: null,
                                type: "note",
                                width: 30,
                                height: 40,
                                parent: "columnToMoveTo"
                            },
                            "column": {
                                id: "column",
                                top: 0,
                                left: 0,
                                zIndex: 1,
                                content: {
                                    title: "heading",
                                    children: childrenOfColumnOne
                                },
                                type: "column",
                                width: 30,
                                height: 40,
                            },
                            "columnToMoveTo": {
                                id: "columnToMoveTo",
                                top: 0,
                                left: 300,
                                zIndex: 1,
                                content: {
                                    title: "heading",
                                    children: ["300"]
                                },
                                type: "column",
                                width: 400,
                                height: 400,
                            }
                        },
                        currentMaxZIndex: 1
                    }
                });
                container = render(
                    <Provider store={customStore}>
                        <Board />
                    </Provider>
                ).container;
                workspace = page.getByTestId("workspace");
                column = workspace.getByTestId("card-column");
                columnToMoveTo = workspace.getByTestId("card-columnToMoveTo");
                cardInColumnToMove = workspace.getByTestId("card-cardToMove");
            });
            it("to top of column", async () => {
                await userEvent.dragAndDrop(cardInColumnToMove, columnToMoveTo, { targetPosition: { x: 0, y: 0 } });

                const childCards = columnToMoveTo.getChildCards();
                const childrenOfColumnAfterChange =
                    (customStore.getState().workspace.cards["column"].content as HasChildrenIds).children;
                const childrenOfColumnToMoveToAfterChange =
                    (customStore.getState().workspace.cards["columnToMoveTo"].content as HasChildrenIds).children;
                expect(childrenOfColumnAfterChange).toEqual(["100", "200"])
                expect(childrenOfColumnToMoveToAfterChange).toEqual(["cardToMove", "300"]);
                const indexOfMovedItem = childrenOfColumnToMoveToAfterChange.findIndex((cardIds: ID) => cardIds === "cardToMove");
                expect(indexOfMovedItem).toBe(0);
                expect(childCards.elements()[indexOfMovedItem].getAttribute(`data-testid`)).toBe("card-cardToMove");
            });

            it("to bottom of column", async () => {
                const columnRects = (columnToMoveTo.element() as HTMLElement).getClientRects();
                await userEvent.dragAndDrop(
                    cardInColumnToMove,
                    columnToMoveTo,
                    { targetPosition: { x: columnRects[0].width - 2, y: columnRects[0].height - 2 } });

                const childCards = columnToMoveTo.getChildCards();
                const childrenOfColumnAfterChange =
                    (customStore.getState().workspace.cards["column"].content as HasChildrenIds).children;
                const childrenOfColumnToMoveToAfterChange =
                    (customStore.getState().workspace.cards["columnToMoveTo"].content as HasChildrenIds).children;
                expect(childrenOfColumnAfterChange).toEqual(["100", "200"])
                expect(childrenOfColumnToMoveToAfterChange).toEqual(["300", "cardToMove"]);
                const indexOfMovedItem = childrenOfColumnToMoveToAfterChange.findIndex((cardIds: ID) => cardIds === "cardToMove");
                expect(indexOfMovedItem).toBe(1);
                expect(childCards.elements()[indexOfMovedItem].getAttribute(`data-testid`)).toBe("card-cardToMove");
            });

            it("to top of existing child element", async () => {
                const dropElement = columnToMoveTo.getChildCards().nth(0);
                await userEvent.dragAndDrop(
                    cardInColumnToMove,
                    dropElement,
                    { targetPosition: { x: 0, y: 0 } });

                const childCards = columnToMoveTo.getChildCards();
                const childrenOfColumnAfterChange =
                    (customStore.getState().workspace.cards["column"].content as HasChildrenIds).children;
                const childrenOfColumnToMoveToAfterChange =
                    (customStore.getState().workspace.cards["columnToMoveTo"].content as HasChildrenIds).children;
                expect(childrenOfColumnAfterChange).toEqual(["100", "200"])
                expect(childrenOfColumnToMoveToAfterChange).toEqual(["cardToMove", "300"]);
                const indexOfMovedItem = childrenOfColumnToMoveToAfterChange.findIndex((cardIds: ID) => cardIds === "cardToMove");
                expect(indexOfMovedItem).toBe(0);
                expect(childCards.elements()[indexOfMovedItem].getAttribute(`data-testid`)).toBe("card-cardToMove");
            });

            it("to bottom of existing child element", async () => {
                const columnRects = (columnToMoveTo.element() as HTMLElement).getClientRects();
                const dropElement = columnToMoveTo.getChildCards().nth(0);
                await userEvent.dragAndDrop(
                    cardInColumnToMove,
                    dropElement,
                    { x: columnRects[0].width - 2, y: columnRects[0].height - 2 });

                const childCards = columnToMoveTo.getChildCards();
                const childrenOfColumnAfterChange =
                    (customStore.getState().workspace.cards["column"].content as HasChildrenIds).children;
                const childrenOfColumnToMoveToAfterChange =
                    (customStore.getState().workspace.cards["columnToMoveTo"].content as HasChildrenIds).children;
                expect(childrenOfColumnAfterChange).toEqual(["100", "200"])
                expect(childrenOfColumnToMoveToAfterChange).toEqual(["300", "cardToMove"]);
                const indexOfMovedItem = childrenOfColumnToMoveToAfterChange.findIndex((cardIds: ID) => cardIds === "cardToMove");
                expect(indexOfMovedItem).toBe(1);
                expect(childCards.elements()[indexOfMovedItem].getAttribute(`data-testid`)).toBe("card-cardToMove");
            });
        });
    });
    describe("heading behaviour", () => {
        let customStore: ReturnType<typeof setupStore>;
        beforeEach(() => {
            customStore = setupStore({
                workspace: {
                    id: "foo",
                    description: "",
                    cards: {
                        "100": {
                            id: "100",
                            top: 10,
                            left: 10,
                            zIndex: 1,
                            content: null,
                            type: "note",
                            width: 30,
                            height: 40,
                            parent: "column"
                        },
                         "200": {
                                id: "200",
                                top: 200,
                                left: 200,
                                zIndex: 1,
                                content: null,
                                type: "note",
                                width: 200,
                                height: 300
                            },
                        "column": {
                            id: "column",
                            top: 10,
                            left: 10,
                            zIndex: 1,
                            content: {
                                title: "heading",
                                children: ["100"]
                            },
                            type: "column",
                            width: 30,
                            height: 40,
                        }
                    },
                    currentMaxZIndex: 1
                }
            });
        })
        it("should not have heading as content editable when not selected", async () => {
            render(
                <Provider store={customStore}>
                    <Board />
                </Provider>
            );

            const workspace = page.getByTestId("workspace");
            const column = workspace.getByTestId("card-column");
            expect(column.getByRole("heading").element().getAttribute("contenteditable")).toBe("false");
        });

        it("should have heading as content editable when not selected", async () => {
            render(
                <Provider store={customStore}>
                    <div className="app">
                        <Board />
                    </div>
                </Provider>
            );

            const workspace = page.getByTestId("workspace");
            const column = workspace.getByTestId("card-column");
            const heading = column.getByRole("heading");
            await column.click({ position: { x: 10, y: 10 } });
            await heading.click({ position: { x: 10, y: 10 } });
            expect(heading.element().getAttribute("contenteditable")).toBe("true");
        });

        it("should disable dragging when heading clicked", async () => {
            render(
                <Provider store={customStore}>
                    <div className="app">
                        <Board />
                    </div>
                </Provider>
            );

            const workspace = page.getByTestId("workspace");
            const column = workspace.getByTestId("card-column");
            const heading = column.getByRole("heading");
            await column.click({ position: { x: 10, y: 10 } });
            await heading.click({ position: { x: 10, y: 10 } });
            expect(column.element().hasAttribute("draggable")).toBe(false);
        });

        it("should reenable dragging when heading blurred", async () => {
            render(
                <Provider store={customStore}>
                    <div className="app">
                        <Board />
                    </div>
                </Provider>
            );

            const workspace = page.getByTestId("workspace");
            let column = workspace.getByTestId("card-column");
            const otherNote = workspace.getByTestId("card-200");
            const heading = column.getByRole("heading");
            await column.click({ position: { x: 10, y: 10 } });
            await heading.click({ position: { x: 10, y: 10 } });
            expect(column.element().hasAttribute("draggable")).toBe(false);
            await otherNote.click({ position: { x: 10, y: 10 } });
            column = workspace.getByTestId("card-column");
            expect(column.element().getAttribute("draggable")).toBe("true");
        });

        it("should update heading when editing", async () => {
            render(
                <Provider store={customStore}>
                    <div className="app">
                        <Board />
                    </div>
                </Provider>
            );

            const workspace = page.getByTestId("workspace");
            let column = workspace.getByTestId("card-column");
            const heading = column.getByRole("heading");
            await column.click({ position: { x: 10, y: 10 } });
            await heading.click({ position: { x: 10, y: 10 } });
            await userEvent.type(heading, "new heading");
            await new Promise((resolve) => { setTimeout(() => resolve(null), 250) });
            const store = customStore.getState(); 
            expect(heading).toHaveFocus();
            
            expect((store.workspace.cards["column"].content as ColumnContent).title).toBe("new heading");
        });
    });
}); 