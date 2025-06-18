import { useCallback, useEffect, useRef, useState } from "react";
import type { CardBase, Edge } from "../../../global";
import invariant from "tiny-invariant";
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { attachClosestEdge, extractClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import type { ColumnContent, ID } from "../../../shared/workspaceTypes";
import { useAppSelector } from "../../workspace/workspaceStore";
import retrieveCardTypeDetails from "../cardRegistry";
import CardContainer from "../CardContainer";

interface ColumnProps extends CardBase {
    content?: ColumnContent
};

const Column = ({ preview, cardData }: ColumnProps) => {
    const columnRef = useRef<HTMLDivElement>(null);
    const { cards } = useAppSelector((state) => state.workspace);
    const [isDraggedOver, setIsDraggedOver] = useState<boolean>(false);
    const [columnEdgeDragLocation, setColumnEdgeDragLocation] = useState<Edge | null>(null);

    const determineClosestEdgeOverride = useCallback((index: number) => {
        if ((columnEdgeDragLocation === "top" && index === 0) || 
            (columnEdgeDragLocation === "bottom" && index === (cardData.content.children.length - 1))) {
            return columnEdgeDragLocation;
        }
        return null;
    }, [columnEdgeDragLocation]);
    useEffect(() => {
        const columnElement = columnRef.current;
        invariant(columnElement, "Column element is not defined");
        return dropTargetForElements({
            element: columnElement,
            onDragStart: () => {
                setIsDraggedOver(true);
            },
            onDragEnter: ({ location }) => {
                if (location.current.dropTargets.length === 1) {
                    setColumnEdgeDragLocation(extractClosestEdge(location.current.dropTargets[0].data) as Edge);
                }
                else {
                    setColumnEdgeDragLocation(null);
                }
                setIsDraggedOver(true);
            },
            onDrag: ({ location }) => {
                if (location.current.dropTargets.length === 1) {
                    setColumnEdgeDragLocation(extractClosestEdge(location.current.dropTargets[0].data) as Edge);
                }
                else {
                    setColumnEdgeDragLocation(null);
                }
            },
            onDragLeave: () => {
                setIsDraggedOver(false);
                setColumnEdgeDragLocation(null);
            },
            getData: ({ input, element }) => {
                return attachClosestEdge({ id: cardData.id, type: cardData.type, isContainer: true }, {
                    input,
                    element,
                    allowedEdges: ['top', 'bottom']
                });
            },
            getIsSticky: () => true,
            onDrop: () => {
                setIsDraggedOver(false);
                setColumnEdgeDragLocation(null);
            },
        });
    }, [cardData, columnRef]);
    const cardDataColumn = cardData.content;

    const renderChildCards = (cardDataColumn: ColumnContent | undefined, cards: Record<ID, any>) => {
        if (!cardDataColumn) 
            return null;
        return (
            <div className="child-cards" data-testid={`column-children-${cardData.id}`}>
                {cardDataColumn.children.map((childId: ID) => {
                    const cardData = cards[childId];
                    return (
                        <CardContainer key={cardData.id} Component={retrieveCardTypeDetails(cardData.type).widget} cardData={cardData} />
                    );
                })}
            </div>
        );
    }

    return (
        <div className={`column-card ${preview ? " preview" : ""}  ${isDraggedOver ? "dragged-over" : ""}`} ref={columnRef}>
            <h2>{cardDataColumn ? cardDataColumn.title : "New Column"}</h2>
            <div>
                {renderChildCards(cardDataColumn, cards)}
            </div>
        </div>
    );
};

export default Column;
