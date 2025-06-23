import { useEffect, useRef } from "react";
import invariant from "tiny-invariant";
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { getReorderDestinationIndex } from "@atlaskit/pragmatic-drag-and-drop-hitbox/util/get-reorder-destination-index";

import { addCards, moveCard } from "./workspaceSlice";
import { useAppDispatch, useAppSelector } from "./workspaceStore";
import CardContainer from "../cards/CardContainer";
import retrieveCardTypeDetails from "../cards/cardRegistry";
import { PREVIEW_OFFSET_X, PREVIEW_OFFSET_Y } from "../../constants";
import { createCard } from "../cards/cardFactory"; 
import type { DropTargetRecord } from "@atlaskit/pragmatic-drag-and-drop/dist/types/internal-types";
import type { CardType, ColumnContent, HasChildrenIds, ID } from "../../shared/workspaceTypes";
import { CardStatus, type DragCardData, type Edge } from "../../global";

const Workspace = () => {
    const workspaceRef = useRef<HTMLDivElement>(null);
    const { cards } = useAppSelector((state) => state.workspace);
    const dispatch = useAppDispatch();

    const findPosition = (dropTargets: DropTargetRecord[], container: DropTargetRecord, movedCard: DragCardData) => {
        // the user has dragged onto the workspace
        if (!container?.data.id) {
            return null;
        }

        const closestEdgeOfColumn = extractClosestEdge(container.data) as Edge;
        // The user has dragged to column without dragging on top of existing cards
        if (container.data?.id && dropTargets[0].data.id === container.data.id) {
            return (
                closestEdgeOfColumn === "top" ? 0 
                                    : (cards[container.data.id as ID].content as HasChildrenIds).children.length);
        }

        const containerCard = cards[container.data.id as ID];
        const containerCardChildren = (containerCard.content as ColumnContent).children;
        const childCardThatWasDraggedUpon = dropTargets[0];
        // The user has dragged a new card or an existing card onto an existing child component
        if (movedCard.status === CardStatus.NEW || cards[movedCard.id!] !== container.data.id) {
            const indexOfTarget = containerCardChildren
                .findIndex((cardId: ID) => cardId === childCardThatWasDraggedUpon.data.id);
            return closestEdgeOfColumn == "bottom" ? indexOfTarget + 1 : indexOfTarget;
        }

        
        const movedCardData = cards[movedCard.id!];

        // The user has dragged an existing item in the column to a different position
        if (container.data.id === movedCardData.parent) {
            const indexOfTarget = containerCardChildren
                .findIndex((cardId) => cardId === childCardThatWasDraggedUpon.data.id);
            const draggedCardIndex = containerCardChildren
                .findIndex((cardId) => cardId === movedCardData.id);
            const destinationIndex = getReorderDestinationIndex({
                startIndex: draggedCardIndex,
                indexOfTarget,
                closestEdgeOfTarget: null,
                axis: "vertical"
            });
            if (destinationIndex === indexOfTarget) {
                return null;
            }

            return destinationIndex;
        }
        return null;
    }

    useEffect(() => {
        const workspaceElement = workspaceRef.current;
        invariant(workspaceElement, "Workspace ref is not defined");
        const findFirstContainer = (dropTargets: Array<DropTargetRecord>, source: DragCardData) : DropTargetRecord => {
            return dropTargets.find((target) => target.data.isContainer && target.data.type !== source.type) as DropTargetRecord;
        };

        /**
         * There can be either 1, 2, or 4 drop targets.
         * 
         * If there is 1, then someone is dragging into the workspace and we should simply add/move the 
         * component into the workspace.
         * 
         * If there are 2, then someone is dragging to the top or bottom of a group component (eg a column)
         * without touching any of the existing cards within the column.
         * 
         * If there is 4, then someone is dragging on top of existing card.
         */
        return dropTargetForElements({
            element: workspaceElement,
            getData: () => {
                return {
                    type: "WORKSPACE",
                    isContainer: true
                };
            },
            onDrop: ({ location, source }) => {
                const { dropTargets } = location.current;
                const containerDropTarget = findFirstContainer(dropTargets, source.data as DragCardData );
                const elementDropLocation = location.current.input;
                const { left, top } = workspaceElement.getBoundingClientRect();
                const { clientX, clientY } = elementDropLocation;
                // In both of these cases, we need to cater for the possibility of moving the item to overlap with
                // the palette, hence the max to zero.
                let parentId = null;
                if (containerDropTarget?.data.id) {
                     parentId = containerDropTarget?.data.id as ID;
                }
                if (source.data.status === CardStatus.NEW) {
                    let newCardData = {
                        left: Math.max(clientX - left - PREVIEW_OFFSET_X, 0),
                        top: Math.max(clientY - top - PREVIEW_OFFSET_Y, 0),
                        width: source.data.width as number,
                        height: source.data.height as number,
                        type: source.data.type as CardType,
                        parent: parentId,
                        position: findPosition(dropTargets, containerDropTarget, source.data as DragCardData)
                    };
                    dispatch(addCards(createCard(newCardData)));
                }
                else if (source.data.status === CardStatus.EXISTING) {
                    const sourceData = source.data as DragCardData;
                    // We need to cater for the fact that it is unlikely that the user is going to drag the item 
                    // from zero. We therefore rely on the data being set in the CardContainer to include the offset 
                    // we need to apply to figure out at the actual top and left.
                    const existingCardData = {
                        id: source.data.id as string,
                        left: Math.max(clientX - left - sourceData.leftOffset!, 0),
                        top: Math.max(clientY - top - sourceData.topOffset!, 0),
                        parent: parentId,
                        position: findPosition(dropTargets, containerDropTarget, source.data as DragCardData)
                    };
                    dispatch(moveCard(existingCardData));
                }
            }
        });
    })
    return (
        <div className="workspace-container" data-testid="workspace">
            <div className="workspace" ref={workspaceRef}>
                {Object.keys(cards)
                    .map((cardKey) =>  cards[cardKey])
                    .filter((card) => !card.parent)
                    .map((card) => {
                        return (<CardContainer key={card.id} Component={retrieveCardTypeDetails(card.type).widget} cardData={card} />);
                    })}

            </div>
        </div>
    );
};

export default Workspace;