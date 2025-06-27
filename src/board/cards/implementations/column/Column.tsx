import React, { useCallback, useEffect, useRef, useState } from "react";
import type { CardBase, Edge } from "../../../../global";
import invariant from "tiny-invariant";
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { attachClosestEdge, extractClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { UpdateContentType, type ColumnContent, type ID } from "../../../../shared/workspaceTypes";
import { useAppDispatch, useAppSelector } from "../../../workspace/workspaceStore";
import retrieveCardTypeDetails from "../../cardRegistry";
import CardContainer from "../../CardContainer";
import ContentEditable, { type ContentEditableEvent } from "../../../../utils/ContentEditable";
import "./Column.css";
import debounce from "../../../../utils/debounce";
import { updateContent } from "../../../workspace/workspaceSlice";

interface ColumnProps extends CardBase {
    content?: ColumnContent
};

const Column = ({ preview, cardData, onFocus, onBlur }: ColumnProps) => {
    const columnRef = useRef<HTMLDivElement>(null);
    const { cards, selection } = useAppSelector((state) => state.workspace);
    const [isDraggedOver, setIsDraggedOver] = useState<boolean>(false);
    const [columnEdgeDragLocation, setColumnEdgeDragLocation] = useState<Edge | null>(null);
    const [headingEditable, setHeadingEditable] = useState<boolean>(false);
    const cardDataColumn = cardData.content as ColumnContent;
    const dispatch = useAppDispatch();
    const [heading, setHeading] = useState<string>(cardData ? cardData.content.title : "New Column");

    const renderHeading = () => {
        if (preview) {
            return (<h2>New Column</h2>);
        }
        return (<ContentEditable html={heading}
            tagName="h2"
            disabled={!headingEditable}
            onChange={onChange}
            onClick={onHeadingClick}
            onFocus={onFocus}
            onBlur={onBlur}>

        </ContentEditable>);
    };

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
    };

    const determineClosestEdgeOverride = useCallback((index: number) => {
        if ((columnEdgeDragLocation === "top" && index === 0) ||
            (columnEdgeDragLocation === "bottom" && index === (cardData.content.children.length - 1))) {
            return columnEdgeDragLocation;
        }
        return null;
    }, [columnEdgeDragLocation]);

    const onHeadingClick = useCallback(() => {
        if (selection?.id === cardData.id && !headingEditable)
            setHeadingEditable(true);
    }, [setHeadingEditable, selection?.id, cardData.id]);

    const onChange = useCallback((event: ContentEditableEvent) => {
        setHeading(event.target.value);
    }, [cardData]);

    const onCardClicked = useCallback((event: React.MouseEvent<HTMLElement>) => {
        if (headingEditable && onBlur) {
            onBlur();
            setHeadingEditable(false);
        }
    }, [onBlur]);

    useEffect(() => {
        if (selection?.id !== cardData.id) {
            setHeadingEditable(false);
        }

    }, [headingEditable, selection]);

    useEffect(() => {
        if (heading === cardDataColumn.title)
            return;
        dispatch(updateContent({
            id: cardData.id,
            updateType: UpdateContentType.UPDATE_FIELDS,
            content: { title: heading }
        }));
    }, [heading]);

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
                setIsDraggedOver(false)
                setColumnEdgeDragLocation(null);
            },
            getData: ({ input, element }) => {
                return attachClosestEdge({ id: cardData.id, type: cardData.type, isContainer: true }, {
                    input,
                    element,
                    allowedEdges: ['top', 'bottom']
                });
            },
            onDrop: () => {
                setIsDraggedOver(false);
                setColumnEdgeDragLocation(null);
            },
        });
    }, [cardData, columnRef]);

    return (
        <div className={`column-card ${preview ? " preview" : ""}  ${isDraggedOver ? "dragged-over" : ""}`} ref={columnRef} onClick={onCardClicked}>
            {renderHeading()}
            <div>
                {renderChildCards(cardDataColumn, cards)}
            </div>
        </div>
    );
};

export default Column;
