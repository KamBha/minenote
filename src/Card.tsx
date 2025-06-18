import { useEffect, useRef, useState } from 'react';
import type { PropsWithChildren } from 'react';
import invariant from 'tiny-invariant';
import { draggable, dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import { attachClosestEdge, extractClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import type { Edge } from './global';
import type { CardData } from './shared/workspaceTypes';
import DropIndicator from './board/workspace/DropIndicator';

type Props = {
    card: CardData,
    index: number,
    columnEdgeDragLocationOverride: Edge | null,
};


const Card = ( { children, card, columnEdgeDragLocationOverride } : PropsWithChildren<Props>) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [closestEdge, setClosestEdge] = useState<Edge | null>(null);

    useEffect(() => {
        const cardElement = cardRef.current;
        invariant(cardElement, 'Card element is not defined');
        return combine(
            draggable({
                element: cardElement,
                getInitialData: () => ({
                    id: card.id,
                    type: 'card'
                }),
                onDragStart: () => {
                    setIsDragging(true);
                },
                onDrop: () => {
                    setIsDragging(false);
                    setClosestEdge(null);
                }
            }),
            dropTargetForElements({
                element: cardElement,
                getData: ({ input, element }) => {
                    const data = { type: "card", id: card.id };

                    return attachClosestEdge(data, {
                        input, 
                        element, 
                        allowedEdges: ['top', 'bottom']
                    });
                },
                getIsSticky: () => true,
                onDragEnter: (args) => {
                    if (args.source.data.id !== card.id) {
                        setClosestEdge(extractClosestEdge(args.self.data) as Edge);
                    }
                },
                onDrag: (args) => {
                    if (args.source.data.id !== card.id) {
                        setClosestEdge(extractClosestEdge(args.self.data) as Edge);
                    }
                },
                onDrop: () => setClosestEdge(null),
                onDragLeave: () => setClosestEdge(null)
            })
        );
    }, [ card.id, cardRef ]);

    return (
        <div className={`card ${isDragging ? 'dragging' : ''}`}  ref={cardRef}>
            {children}
            {(closestEdge || columnEdgeDragLocationOverride) && <DropIndicator edge={closestEdge ? closestEdge : columnEdgeDragLocationOverride} gap="8px" />}
        </div>
    );
};

export default Card;