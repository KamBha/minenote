import { useEffect, useRef, useState, type PropsWithChildren } from "react";
import Card from "./Card";
import type { ColumnData } from "./global";
import invariant from "tiny-invariant";
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";

type Props = {
    columnData: ColumnData;
};

const Column = ({ columnData }: PropsWithChildren<Props>) => {
    const { title, cards, columnId } = columnData;
    const columnRef = useRef<HTMLDivElement>(null);
    const [isDraggedOver, setIsDraggedOver] = useState<boolean>(false);


    useEffect(() => {
        const columnElement = columnRef.current;
        invariant(columnElement, "Column element is not defined");
        return dropTargetForElements({
            element: columnElement,
            onDragStart: () => {
                setIsDraggedOver(true);
            },
            onDragEnter: () => {
                setIsDraggedOver(true);
            },
            onDragLeave: () => {
                setIsDraggedOver(false);
            },
            getData: () => ({ columnId }),
            onDrop: () => { 
                setIsDraggedOver(false);
            },
            getIsSticky: () => true,
        });
    }, [columnId, columnRef]);
    return (
        <div className={`column ${isDraggedOver ? "dragged-over" : ""}`} ref={columnRef}>
            <h2>{title}</h2>
            {cards.map((card) => (
                <Card key={card.id} card={card}>
                {card.content}
                </Card>
            ))}
        </div>
    );
};

export default Column;