
import { useEffect, useRef, useState } from "react";
import { CardStatus } from "../../global";
import { type CardBase, type DragCardData } from "../../global";
import type { CardData } from "../../shared/workspaceTypes";
import invariant from "tiny-invariant";
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import { draggable, dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import debounce from "../../utils/debounce";
import { useAppDispatch } from "../workspace/workspaceStore";
import { resizeCard } from "../workspace/workspaceSlice";
import retrieveCardTypeDetails from "./cardRegistry";
import { attachClosestEdge, extractClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';

interface CardContainerProps {
    Component: React.FC<CardBase>;
    preview?: boolean;
    cardData: CardData;
}

const CardContainer: React.FC<CardContainerProps> = ({ Component, preview = false, cardData }) => {
    const cardContainerRef = useRef<HTMLDivElement>(null);
    const dispatch = useAppDispatch();
    const [isDragging, setIsDragging] = useState(false);
    const { allowHeightSet } = retrieveCardTypeDetails(cardData.type);
    const style: React.CSSProperties = {
        zIndex: cardData.zIndex
    };
    if (!preview && !cardData.parent) {
        style.top = cardData.top;
        style.left = cardData.left;
    }

    // We rely on the CSS to set 
    if (!cardData.parent) {
        style.width = cardData.width;
        if (allowHeightSet)
            style.height = cardData.height;
    }

    useEffect(() => {
        const itemElement = cardContainerRef.current;
        invariant(itemElement, "Item element is not defined");
        let resizeObserver: ResizeObserver | null = null;
        if (!cardData.parent) {
            resizeObserver = new ResizeObserver((entries) => {
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
        }
        return combine(
            () => {
                if (resizeObserver)
                    resizeObserver.disconnect();
            },
            draggable({
                element: itemElement,
                getInitialData: ({ input, element }): DragCardData => {
                    const elementRects = element.getBoundingClientRect();
                    // We need this information to properly calculate the actual left and top for the moved card.
                    const topOffset = input.clientY - elementRects.top;
                    const leftOffset = input.clientX - elementRects.left;
                    return {
                        ...cardData,
                        status: CardStatus.EXISTING,
                        topOffset,
                        leftOffset
                    };
                }, 
                onDragStart: () => {
                    setIsDragging(true);
                },
                onDrop: () => {
                    setIsDragging(false);
                },
            }),
            dropTargetForElements({
                element: itemElement,
                getData: ({ input, element }) => {
                    const data = { 
                        type: cardData.type, 
                        id: cardData.id, 
                        isContainer: !!retrieveCardTypeDetails(cardData.type).isContainer
                    };

                    return attachClosestEdge(data, {
                        input, 
                        element, 
                        allowedEdges: ['top', 'bottom']
                    });
                },
                getIsSticky: () => true
            })
        );
    });
    return (
        <div className={`base-card ${cardData.parent ? "has-parent" : "" } ${preview ? " preview" : ""} ${cardData.type} ${isDragging ? " dragging" : ""} ${cardData.parent ? " is-child" : ""}`} 
            style={style} 
            ref={cardContainerRef} 
            data-testid={`card-${cardData.id}`}>
            <Component preview={preview} cardData={cardData} />
        </div>
    );
};

export default CardContainer;