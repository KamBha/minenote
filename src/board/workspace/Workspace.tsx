import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { useEffect, useRef } from "react";
import invariant from "tiny-invariant";

import { addCard, moveCard } from "./workspaceSlice";
import { useAppDispatch, useAppSelector } from "./workspaceStore";
import type { CardType } from "../../shared/workspace";
import BaseCard from "../../cards/BaseCard";
import determineCard from "../../cards/cardRegistry";
import { PREVIEW_OFFSET_X, PREVIEW_OFFSET_Y } from "../../constants";

const Workspace = () => {
    const workspaceRef = useRef<HTMLDivElement>(null);
    const { cards } = useAppSelector((state) => {
        return state.workspace
    });
    const dispatch = useAppDispatch();
    useEffect(() => {
        const workspaceElement = workspaceRef.current;
        invariant(workspaceElement, "Workspace ref is not defined");
        return dropTargetForElements({
            element: workspaceElement,
            onDrop: ({ location, source }) => {
                const elementDropLocation = location.current.input;
                const { left, top } = workspaceElement.getBoundingClientRect();
                const { clientX, clientY } = elementDropLocation;
                // In both of these cases, we need to cater for the possibility of moving the item to overlap with
                // the palette, hence the max to zero.
                if (source.data.status === "NEW") {
                    const newCardData = {
                        left: Math.max(clientX - left - PREVIEW_OFFSET_X, 0),
                        top: Math.max(clientY - top - PREVIEW_OFFSET_Y, 0),
                        width: source.data.width as number,
                        height: source.data.height as number,
                        type: source.data.type as CardType
                    };
                    dispatch(addCard(newCardData));
                }
                else if (source.data.status === "EXISTING") {
                    const sourceData = source.data as any;  // TODO: fix types
                    // We need to cater for the fact that it is unlikely that the user is going to drag the item 
                    // from zero. We therefore rely on the data being set in the BaseCard to include the offset 
                    // we need to apply to figure out at the actual top and left.
                    const existingCardData = {
                        id: source.data.id as string,
                        left: Math.max(clientX - left - sourceData.leftOffset, 0),
                        top: Math.max(clientY - top - sourceData.topOffset, 0)
                    };
                    dispatch(moveCard(existingCardData))

                }
            }
        });
    })
    return (
        <div className="workspace-container" data-testid="workspace">
            <div className="workspace" ref={workspaceRef}>
                {Object.keys(cards).map((cardKey) => {
                    const card = cards[cardKey];
                    return (<BaseCard key={card.id} Component={determineCard(card.type).widget} cardData={card} />);
                })}

            </div>
        </div>
    );
};

export default Workspace;