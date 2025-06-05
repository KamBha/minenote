import { describe, it, expect, beforeEach, vi } from "vitest";
import { setupStore } from "./workspaceStore";
import { addCard, moveCard, deleteCard, resizeCard } from "./workspaceSlice";
import type { AddNewCard, MoveCard } from "../../shared/workspace";
import { createId } from "./idGenerator";

vi.mock("./idGenerator", () => ({
    createId: vi.fn(),
}));

describe("workspaceStore", () => {
    let store: ReturnType<typeof setupStore>;

    beforeEach(() => {
        store = setupStore();
        vi.resetAllMocks();
    });

    it("should add a card with addCard", () => {
        vi.mocked(createId).mockReturnValue("foo");
        const card: AddNewCard = {
            type: "note",
            left: 10,
            top: 20,
            width: 100,
            height: 200,
        };
        store.dispatch(addCard(card));
        const state = store.getState();
        expect(state.workspace.cards["foo"]).toMatchObject({
            ...card,
            zIndex: 1,
            id: "foo",
            content: null
        });
        expect(state.workspace.currentMaxZIndex).toBe(2);
        const foo = state.workspace.cards["foo"];
        expect(foo.content).toBeNull();
    });

    it("should move a card with moveCard and update zIndex", () => {
        vi.mocked(createId).mockReturnValue("card2");
        const card: AddNewCard = {
            type: "note",
            left: 0,
            top: 0,
            width: 100,
            height: 200
        };
        store.dispatch(addCard(card));
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
        expect(state.workspace.currentMaxZIndex).toBe(3);
    });

    it("should not throw when moving a non-existent card", () => {
        const move: MoveCard = {
            id: "ghost",
            top: 1,
            left: 2,
        };
        expect(() => store.dispatch(moveCard(move))).not.toThrow();
        const state = store.getState();
        expect(state.workspace.cards["ghost"]).toMatchObject({
            ...move,
            zIndex: 1
        });
    });

    it("should increment zIndex correctly for multiple cards", () => {
        vi.mocked(createId).mockReturnValue("a").mockReturnValue("b");
        store.dispatch(addCard({ top: 0, left: 0, width: 10, height: 20, type: "note" }));
        store.dispatch(addCard({ left: 0, top: 0, width: 10, height: 20, type: "note" }));
        store.dispatch(moveCard({ id: "a", top: 5, left: 5 }));
        const state = store.getState();
        expect(state.workspace.cards["a"].zIndex).toBe(3);
        expect(state.workspace.cards["b"].zIndex).toBe(2);
        expect(state.workspace.currentMaxZIndex).toBe(4);
    });

    it("should delete cards added", () => {
        vi.mocked(createId).mockReturnValue("a");
        store.dispatch(addCard({ top: 0, left: 0, width: 10, height: 20, type: "note" }));
        let state = store.getState();
        expect(state.workspace.cards["a"]).toBeDefined();
        store.dispatch(deleteCard({ id: "a" }));
        state = store.getState();
        expect(state.workspace.cards["a"]).toBeUndefined();
    });

    it("should resize cards when resize action dispatched", () => {
        vi.mocked(createId).mockReturnValue("a");
        store.dispatch(addCard({ top: 0, left: 0, width: 10, height: 20, type: "note" }));
        store.dispatch(resizeCard({ id: "a", height: 4, width: 5 }));
        let state = store.getState();
        expect(state.workspace.cards["a"].height).toBe(4);
        expect(state.workspace.cards["a"].width).toBe(5);
        expect(state.workspace.currentMaxZIndex).toBe(3);
    });
});