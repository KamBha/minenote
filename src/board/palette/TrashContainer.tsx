import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { useEffect, useRef } from "react";
import Trash from "../../assets/trash.svg?react";
import { useAppDispatch } from "../workspace/workspaceStore";
import invariant from "tiny-invariant";
import { deleteCard } from "../workspace/workspaceSlice";

const TrashContainer = () => {
    const trashRef = useRef<HTMLDivElement>(null);
    const dispatch = useAppDispatch();
    useEffect(() => {
        const trashElement = trashRef.current;
        invariant(trashRef, "Trash ref is not defined");

        return dropTargetForElements({
            element: trashElement as Element,
            onDrop: ({ source }) => {
                if (source.data.status === "EXISTING") {
                    dispatch(deleteCard({ id: (source.data.id as string) }));
                }
            }
        });
    });
    return (
        <div className="trash" data-testid="trash" ref={trashRef}>
            <Trash />
            <p>Trash</p>
        </div>
    );
};

export default TrashContainer;