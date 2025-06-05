import { renderHook, act } from "@testing-library/react";
import { vi, describe, it, expect } from "vitest";
import debounce from "./debounce";

vi.useFakeTimers();

describe("useDebounce", () => {
    it("should debounce the function call", () => {
        const fn = vi.fn();
        const { result } = renderHook(() => debounce(fn, 500));

        // Call the debounced function multiple times quickly
        act(() => {
            result.current("a");
            result.current("b");
            result.current("c");
        });

        // Function should not be called immediately
        expect(fn).not.toHaveBeenCalled();

        // Fast-forward time
        act(() => {
            vi.advanceTimersByTime(500);
        });

        // Only the last call should be executed
        expect(fn).toHaveBeenCalledTimes(1);
        expect(fn).toHaveBeenCalledWith("c");
    });
});