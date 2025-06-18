import { describe, it, expect, vi, beforeEach } from "vitest";
import { createCard } from "./cardFactory";
import type { BaseCardData } from "../../shared/workspaceTypes";
import { createId } from "../workspace/idGenerator";


vi.mock("../workspace/idGenerator", () => ({
    createId: vi.fn(),
}));

describe("createCard", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        vi.mocked(createId).mockReturnValue("foo");
    });

    it("should return an object that includes all values from commonCardInfo", () => {
        const commonCardInfo: BaseCardData = {
            type: "note",
            width: 100,
            height: 200,
            left: 10,
            top: 20,
        };
        const resultArray = createCard(commonCardInfo);
        const result = resultArray[0];
        
        expect(resultArray.length).toBe(1);
        expect(result.type).toBe("note");
        expect(result.width).toBe(100);
        expect(result.height).toBe(200);
        expect(result.left).toBe(10);
        expect(result.top).toBe(20);
    });

    it("should add id from createId", () => {
        vi.mocked(createId).mockReturnValue("foo");

        const commonCardInfo: BaseCardData = {
            type: "note",
            width: 100,
            height: 200,
            left: 10,
            top: 20,
        };
        const result = createCard(commonCardInfo)[0];
                
        expect(result.id).toBe("foo");
    });

    it("should correctly set content for note", () => {
        const commonCardInfo: BaseCardData = {
            type: "note",
            width: 100,
            height: 200,
            left: 10,
            top: 20,
        };
        const resultArray = createCard(commonCardInfo);
        const result = resultArray[0];
        
        expect(resultArray.length).toBe(1);
        expect(result.type).toBe("note");
        expect(result.width).toBe(100);
        expect(result.height).toBe(200);
        expect(result.left).toBe(10);
        expect(result.top).toBe(20);
        expect(result.content).toBe(null);
    });

    it("should correctly create column", () => {
        vi.mocked(createId).mockReturnValueOnce("foo").mockReturnValueOnce("bar");
        const commonCardInfo: BaseCardData = {
            type: "column",
            width: 100,
            height: 200,
            left: 10,
            top: 20,
        };
        const resultArray = createCard(commonCardInfo);
        const [note, column] = resultArray;
        
        expect(resultArray.length).toBe(2);
        expect(note.id).toBe("bar");
        expect(note.type).toBe("note");
        expect(note.width).toBe(100);
        expect(note.height).toBe(200);
        expect(note.left).toBe(10);
        expect(note.top).toBe(20);
        expect(note.content).toBe(null);
        expect(note.parent).toBe("foo");

        expect(column.type).toBe("column");
        expect(column.id).toBe("foo");
        expect(column.width).toBe(100);
        expect(column.height).toBe(200);
        expect(column.left).toBe(10);
        expect(column.top).toBe(20);
        expect(column.content.title).toBe("New Column");
        expect(column.content.children.length).toBe(0);
    });
});
