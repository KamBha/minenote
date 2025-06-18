import { describe, it, expect, beforeEach, vi } from "vitest";
import { setupStore } from "./workspaceStore";
import { addCards, moveCard, deleteCard, resizeCard } from "./workspaceSlice";
import type { AddNewCards, HasChildrenIds, MoveCard } from "../../shared/workspaceTypes";

describe("workspaceStore", () => {
    let store: ReturnType<typeof setupStore>;

    beforeEach(() => {
        store = setupStore();
        vi.resetAllMocks();
    });

    describe("addCard", () => {
        it("should add a card with addCard", () => {
            const card: AddNewCards = [{
                id: "foo",
                type: "note",
                left: 10,
                top: 20,
                width: 100,
                height: 200,
                content: null
            }];
            store.dispatch(addCards(card));
            const state = store.getState();
            expect(state.workspace.cards["foo"]).toMatchObject({
                id: "foo",
                type: "note",
                left: 10,
                top: 20,
                width: 100,
                height: 200,
                zIndex: 2,
                content: null
            });
            expect(state.workspace.currentMaxZIndex).toBe(2);
            const foo = state.workspace.cards["foo"];
            expect(foo.content).toBeNull();
        });

        it("should add multiple cards with addCard", () => {
            const existingCards: AddNewCards = [{
                id: "foo",
                type: "note",
                left: 10,
                top: 20,
                width: 100,
                height: 200,
                content: null
            },
            {
                id: "bar",
                type: "note",
                left: 10,
                top: 20,
                width: 100,
                height: 200,
                content: null
            },
            ];
            store.dispatch(addCards(existingCards));
            const state = store.getState();
            expect(state.workspace.cards["foo"]).toMatchObject({
                id: "foo",
                type: "note",
                left: 10,
                top: 20,
                width: 100,
                height: 200,
                zIndex: 2,
                content: null
            });

            expect(state.workspace.cards["bar"]).toMatchObject({
                id: "bar",
                type: "note",
                left: 10,
                top: 20,
                width: 100,
                height: 200,
                zIndex: 2,
                content: null
            });
            expect(state.workspace.currentMaxZIndex).toBe(2);
        });

        describe("add to container", () => {
            beforeEach(() => {
                store = setupStore({
                    workspace: {
                        id: "foo",
                        description: "",
                        cards: {
                            "foo": {
                                id: "foo",
                                top: 0,
                                left: 0,
                                zIndex: 1,
                                content: null,
                                type: "note",
                                width: 30,
                                height: 40,
                                parent: "column"
                            },
                            "boo": {
                                id: "boo",
                                top: 0,
                                left: 0,
                                zIndex: 1,
                                content: null,
                                type: "note",
                                width: 30,
                                height: 40,
                                parent: "column"
                            },

                            "bar": {
                                id: "bar",
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
                                    children: ["foo", "boo", "bar"]
                                },
                                type: "column",
                                width: 30,
                                height: 40,
                            }
                        },
                        currentMaxZIndex: 1
                    }
                });
            });
            it("when in middle", () => {
                const newCard: AddNewCards = [{
                    id: "new",
                    type: "note",
                    left: 10,
                    top: 20,
                    width: 100,
                    height: 200,
                    parent: "column",
                    position: 1,
                    content: null
                }];
                store.dispatch(addCards(newCard));
                const state = store.getState();
                const columnChildren = (state.workspace.cards["column"].content as HasChildrenIds).children;
                expect(columnChildren.length).toBe(4);
                expect(columnChildren).toEqual(["foo", "new", "boo", "bar"]);
            });

            it("when at start", () => {
                const newCard: AddNewCards = [{
                    id: "new",
                    type: "note",
                    left: 10,
                    top: 20,
                    width: 100,
                    height: 200,
                    parent: "column",
                    position: 0,
                    content: null
                }];
                store.dispatch(addCards(newCard));
                const state = store.getState();
                const columnChildren = (state.workspace.cards["column"].content as HasChildrenIds).children;
                expect(columnChildren.length).toBe(4);
                expect(columnChildren).toEqual(["new", "foo", "boo", "bar"]);
            });

            it("when at end", () => {
                const newCard: AddNewCards = [{
                    id: "new",
                    type: "note",
                    left: 10,
                    top: 20,
                    width: 100,
                    height: 200,
                    parent: "column",
                    position: 4,
                    content: null
                }];
                store.dispatch(addCards(newCard));
                const state = store.getState();
                const columnChildren = (state.workspace.cards["column"].content as HasChildrenIds).children;
                expect(columnChildren.length).toBe(4);
                expect(columnChildren).toEqual(["foo", "boo", "bar", "new"]);
            });
        });
    });

    describe("moveCard", () => {
        it("should move a card with moveCard and update zIndex", () => {
            const card: AddNewCards = [{
                id: "card2",
                type: "note",
                left: 0,
                top: 0,
                width: 100,
                height: 200
            }];
            store.dispatch(addCards(card));
            const move: MoveCard = {
                id: "card2",
                left: 50,
                top: 60
            };
            store.dispatch(moveCard(move));
            const state = store.getState();
            expect(state.workspace.cards["card2"]).toMatchObject({
                ...move,
                zIndex: 2
            });
            expect(state.workspace.currentMaxZIndex).toBe(2);
        });

        it("should increment zIndex correctly for multiple cards", () => {
            store.dispatch(addCards([{ id: "a", top: 0, left: 0, width: 10, height: 20, type: "note" }]));
            store.dispatch(addCards([{ id: "b", left: 0, top: 0, width: 10, height: 20, type: "note" }]));
            store.dispatch(moveCard({ id: "a", top: 5, left: 5 }));
            const state = store.getState();
            expect(state.workspace.cards["a"].zIndex).toBe(4);
            expect(state.workspace.cards["b"].zIndex).toBe(3);
            expect(state.workspace.currentMaxZIndex).toBe(4);
        });

        it("should increment currentMaxZIndex once when same card moved multiple times", () => {
            store.dispatch(addCards([{ id: "a", top: 0, left: 0, width: 10, height: 20, type: "note" }]));
            store.dispatch(moveCard({ id: "a", top: 5, left: 5 }));
            store.dispatch(moveCard({ id: "a", top: 5, left: 6 }));
            const state = store.getState();
            expect(state.workspace.cards["a"].zIndex).toBe(2);
            expect(state.workspace.currentMaxZIndex).toBe(2);
        });

        describe("move to container from workspace", () => {
            beforeEach(() => {
                store = setupStore({
                    workspace: {
                        id: "foo",
                        description: "",
                        cards: {
                            "foo": {
                                id: "foo",
                                top: 0,
                                left: 0,
                                zIndex: 1,
                                content: null,
                                type: "note",
                                width: 30,
                                height: 40,
                                parent: "column"
                            },
                            "boo": {
                                id: "boo",
                                top: 0,
                                left: 0,
                                zIndex: 1,
                                content: null,
                                type: "note",
                                width: 30,
                                height: 40,
                                parent: "column"
                            },

                            "bar": {
                                id: "bar",
                                top: 0,
                                left: 0,
                                zIndex: 1,
                                content: null,
                                type: "note",
                                width: 30,
                                height: 40,
                                parent: "column"
                            },
                            "movedCard": {
                                id: "movedCard",
                                top: 0,
                                left: 0,
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
                                    children: ["foo", "boo", "bar"]
                                },
                                type: "column",
                                width: 30,
                                height: 40,
                            }
                        },
                        currentMaxZIndex: 1
                    }
                });
            });
            it("when in middle", () => {
                const newCard: MoveCard = {
                    id: "movedCard",
                    left: 10,
                    top: 20,
                    parent: "column",
                    position: 1,
                };
                store.dispatch(moveCard(newCard));
                const state = store.getState();
                const columnChildren = (state.workspace.cards["column"].content as HasChildrenIds).children;
                expect(columnChildren.length).toBe(4);
                expect(columnChildren).toEqual(["foo", "movedCard", "boo", "bar"]);
            });

            it("when at start", () => {
                const newCard: MoveCard = {
                    id: "movedCard",
                    left: 10,
                    top: 20,
                    parent: "column",
                    position: 0,
                };
                store.dispatch(moveCard(newCard));
                const state = store.getState();
                const columnChildren = (state.workspace.cards["column"].content as HasChildrenIds).children;
                expect(columnChildren.length).toBe(4);
                expect(columnChildren).toEqual(["movedCard", "foo", "boo", "bar"]);
            });

            it("when at end", () => {
                const newCard: MoveCard = {
                    id: "movedCard",
                    left: 10,
                    top: 20,
                    parent: "column",
                    position: 3,
                };
                store.dispatch(moveCard(newCard));
                const state = store.getState();
                const columnChildren = (state.workspace.cards["column"].content as HasChildrenIds).children;
                expect(columnChildren.length).toBe(4);
                expect(columnChildren).toEqual(["foo", "boo", "bar", "movedCard"]);
            });
        });

        describe("move to container from another container", () => {
            beforeEach(() => {
                store = setupStore({
                    workspace: {
                        id: "foo",
                        description: "",
                        cards: {
                            "foo": {
                                id: "foo",
                                top: 0,
                                left: 0,
                                zIndex: 1,
                                content: null,
                                type: "note",
                                width: 30,
                                height: 40,
                                parent: "columnToMoveFrom"
                            },
                            "boo": {
                                id: "boo",
                                top: 0,
                                left: 0,
                                zIndex: 1,
                                content: null,
                                type: "note",
                                width: 30,
                                height: 40,
                                parent: "columnToMoveFrom"
                            },

                            "bar": {
                                id: "bar",
                                top: 0,
                                left: 0,
                                zIndex: 1,
                                content: null,
                                type: "note",
                                width: 30,
                                height: 40,
                                parent: "columnToMoveFrom"
                            },
                            "baz": {
                                id: "baz",
                                top: 0,
                                left: 0,
                                zIndex: 1,
                                content: null,
                                type: "note",
                                width: 30,
                                height: 40,
                                parent: "columnToMoveTo"
                            },
                            "boz": {
                                id: "boz",
                                top: 0,
                                left: 0,
                                zIndex: 1,
                                content: null,
                                type: "note",
                                width: 30,
                                height: 40,
                                parent: "columnToMoveTo"
                            },
                            "bol": {
                                id: "bol",
                                top: 0,
                                left: 0,
                                zIndex: 1,
                                content: null,
                                type: "note",
                                width: 30,
                                height: 40,
                                parent: "columnToMoveTo"
                            },
                            "movedCard": {
                                id: "movedCard",
                                top: 0,
                                left: 0,
                                zIndex: 1,
                                content: null,
                                type: "note",
                                width: 30,
                                height: 40,
                                parent: "columnToMoveFrom"
                            },
                            "columnToMoveFrom": {
                                id: "columnToMoveFrom",
                                top: 0,
                                left: 0,
                                zIndex: 1,
                                content: {
                                    title: "heading",
                                    children: ["foo", "boo", "movedCard", "bar"]
                                },
                                type: "column",
                                width: 30,
                                height: 40,
                            },

                            "columnToMoveTo": {
                                id: "columnToMoveTo",
                                top: 0,
                                left: 0,
                                zIndex: 1,
                                content: {
                                    title: "heading",
                                    children: ["baz", "boz", "bol"]
                                },
                                type: "column",
                                width: 30,
                                height: 40,
                            },
                        },
                        currentMaxZIndex: 1
                    }
                });
            });
            it("when in middle", () => {
                const newCard: MoveCard = {
                    id: "movedCard",
                    left: 10,
                    top: 20,
                    parent: "columnToMoveTo",
                    position: 1,
                };
                store.dispatch(moveCard(newCard));
                const state = store.getState();
                const columnChildrenMovedFrom = (state.workspace.cards["columnToMoveFrom"].content as HasChildrenIds).children;
                const columnChildrenMovedTo = (state.workspace.cards["columnToMoveTo"].content as HasChildrenIds).children;
                expect(columnChildrenMovedFrom.length).toBe(3);
                expect(columnChildrenMovedFrom).toEqual(["foo", "boo", "bar"]);
                expect(columnChildrenMovedTo.length).toBe(4);
                expect(columnChildrenMovedTo).toEqual(["baz", "movedCard", "boz", "bol"]);
            });

            it("when at start", () => {
                const newCard: MoveCard = {
                    id: "movedCard",
                    left: 10,
                    top: 20,
                    parent: "columnToMoveTo",
                    position: 0,
                };
                store.dispatch(moveCard(newCard));
                const state = store.getState();
                const columnChildrenMovedFrom = (state.workspace.cards["columnToMoveFrom"].content as HasChildrenIds).children;
                const columnChildrenMovedTo = (state.workspace.cards["columnToMoveTo"].content as HasChildrenIds).children;
                expect(columnChildrenMovedFrom.length).toBe(3);
                expect(columnChildrenMovedFrom).toEqual(["foo", "boo", "bar"]);
                expect(columnChildrenMovedTo.length).toBe(4);
                expect(columnChildrenMovedTo).toEqual(["movedCard", "baz", "boz", "bol"]);
            });

            it("when at end", () => {
                const newCard: MoveCard = {
                    id: "movedCard",
                    left: 10,
                    top: 20,
                    parent: "columnToMoveTo",
                    position: 4,
                };
                store.dispatch(moveCard(newCard));
                const state = store.getState();
                const columnChildrenMovedFrom = (state.workspace.cards["columnToMoveFrom"].content as HasChildrenIds).children;
                const columnChildrenMovedTo = (state.workspace.cards["columnToMoveTo"].content as HasChildrenIds).children;
                expect(columnChildrenMovedFrom.length).toBe(3);
                expect(columnChildrenMovedFrom).toEqual(["foo", "boo", "bar"]);
                expect(columnChildrenMovedTo.length).toBe(4);
                expect(columnChildrenMovedTo).toEqual(["baz", "boz", "bol", "movedCard"]);
            });
        });
    });

    describe("deleteCard", () => {
        it("should delete cards added", () => {
            store.dispatch(addCards([{ id: "a", top: 0, left: 0, width: 10, height: 20, type: "note" }]));
            let state = store.getState();
            expect(state.workspace.cards["a"]).toBeDefined();
            store.dispatch(deleteCard({ id: "a" }));
            state = store.getState();
            expect(state.workspace.cards["a"]).toBeUndefined();
        });

        it("should delete children cards as well", () => {
            store = setupStore({
                workspace: {
                    id: "foo",
                    description: "",
                    cards: {
                        "foo": {
                            id: "foo",
                            top: 0,
                            left: 0,
                            zIndex: 1,
                            content: null,
                            type: "note",
                            width: 30,
                            height: 40,
                            parent: "column"
                        },

                        "boo": {
                            id: "boo",
                            top: 0,
                            left: 0,
                            zIndex: 1,
                            content: null,
                            type: "note",
                            width: 30,
                            height: 40,
                        },

                        "bar": {
                            id: "bar",
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
                                children: ["foo", "bar"]
                            },
                            type: "column",
                            width: 30,
                            height: 40,
                        }
                    },
                    currentMaxZIndex: 1
                }
            });

            store.dispatch(deleteCard({ id: "column" }));       
            const cards = store.getState().workspace.cards;
            expect(Object.keys(cards).length).toBe(1);
            expect(cards["boo"].id).toBe("boo");
        });
    });

    describe("resizeCard", () => {
        it("should resize cards when resize action dispatched", () => {
            store.dispatch(addCards([{ id: "a", top: 0, left: 0, width: 10, height: 20, type: "note" }]));
            store.dispatch(resizeCard({ id: "a", height: 4, width: 5 }));
            let state = store.getState();
            expect(state.workspace.cards["a"].height).toBe(4);
            expect(state.workspace.cards["a"].width).toBe(5);
            expect(state.workspace.currentMaxZIndex).toBe(2);
        });

        it("calling resize multiple times should only update the currentMaxZIndex once", () => {
            store.dispatch(addCards([{ id: "a", top: 0, left: 0, width: 10, height: 20, type: "note" }]));
            store.dispatch(resizeCard({ id: "a", height: 4, width: 5 }));
            store.dispatch(resizeCard({ id: "a", height: 4, width: 6 }));

            let state = store.getState();

            expect(state.workspace.currentMaxZIndex).toBe(2);
        });
    });
});