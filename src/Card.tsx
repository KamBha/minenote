import { useEffect, useRef, useState } from 'react';
import type { PropsWithChildren } from 'react';
import invariant from 'tiny-invariant';
import { draggable, dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import { attachClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import type { CardData } from './global';

type Props = {
    card: CardData
};


const Card = ( { children, card } : PropsWithChildren<Props>) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState<boolean>(false);
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
                } ,
                onDrop: () => setIsDragging(false)
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
                        console.log("onDragEnter", args);
                    }
                }
            })
        );
    }, [ card.id, cardRef ]);

    return (
        <div className={`card ${isDragging ? 'dragging' : ''}`}  ref={cardRef}>
            {children}
        </div>
    );
};

export default Card;