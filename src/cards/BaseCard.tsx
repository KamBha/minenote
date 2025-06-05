
import { useEffect, useRef, useState } from "react";
import type { CardBase } from "../global";
import type { CardData } from "../shared/workspace";
import invariant from "tiny-invariant";
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import { draggable } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import debounce from "../utils/debounce";
import { useAppDispatch } from "../board/workspace/workspaceStore";
import { resizeCard } from "../board/workspace/workspaceSlice";

interface BaseCardProps {
    Component: React.FC<CardBase>;
    preview?: boolean;
    cardData: CardData;
}

const BaseCard: React.FC<BaseCardProps> = ({ Component, preview = false, cardData }) => {
    const baseCardRef = useRef<HTMLDivElement>(null);
    const dispatch = useAppDispatch();
    const [isDragging, setIsDragging] = useState(false);
    const style: React.CSSProperties = {
        width: cardData.width + "px",
        height: cardData.height + "px",
        zIndex: cardData.zIndex
    };

    if (!preview) {
        style.top = cardData.top;
        style.left = cardData.left;
    }

    useEffect(() => {
        const itemElement = baseCardRef.current;
        invariant(itemElement, "Item element is not defined");
        const resizeObserver = new ResizeObserver((entries) => {
            const debouncedResizerCallback = debounce(() => {
                const clientRects = itemElement.getClientRects();
                // This happens on move because we hide the element when we drag
                if (clientRects.length === 0) {
                    return;
                }
                // We don't bother with the client rects as we cannot use the border box size due to
                // the values changing depending on whether you use vertical writing or horizontal 
                // writing. See https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserverEntry/borderBoxSize
                const { height, width } = itemElement.getClientRects()[0];
                if (cardData.height !== height || cardData.width !== width) {
                    dispatch(resizeCard({
                        id: cardData.id,
                        height,
                        width
                    }));
                }
            }, 300);
            requestAnimationFrame(() => {
                if (entries.length > 0)
                    debouncedResizerCallback();
            });
        });
        resizeObserver.observe(itemElement);
        return combine(
            () => {
                resizeObserver.disconnect();
            },
            draggable({
                element: itemElement,
                getInitialData: ({ input, element }) => {
                    const elementRects = element.getBoundingClientRect();
                    // We need this information to properly calculate the actual left and top for the moved card.
                    const topOffset = input.clientY - elementRects.top;
                    const leftOffset = input.clientX - elementRects.left;
                    return {
                        ...cardData,
                        status: "EXISTING",
                        topOffset,
                        leftOffset
                    };
                },
                onDragStart: () => {
                    setIsDragging(true);
                },
                onDrop: () => {
                    setIsDragging(false);
                }

            })
        );
    });
    return (
        <div className={`base-card ${preview ? " preview" : ""} ${cardData.type} ${isDragging ? " dragging" : ""}`} style={style} ref={baseCardRef}>
            <Component preview={preview} cardData={cardData} />
        </div>
    );
};

export default BaseCard;