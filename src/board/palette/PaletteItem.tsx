import { draggable } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import React, { useEffect, useRef, useState } from "react";
import invariant from "tiny-invariant";
import { setCustomNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview';
import BaseCard from "../../cards/BaseCard";
import Note from "../../cards/implementations/Note";
import { createRoot } from "react-dom/client";
import store, { useAppSelector } from "../workspace/workspaceStore";
import { PREVIEW_OFFSET_X, PREVIEW_OFFSET_Y } from "../../constants";
import { Provider } from "react-redux";


interface PaletteItemProps {
    Icon: React.FC<React.SVGProps<SVGSVGElement>>;
    label: string;
    type?: string;
    defaultHeight: number;
    defaultWidth: number;
}

const PaletteItem: React.FC<PaletteItemProps> = ({ Icon, label, type, defaultHeight:height, defaultWidth:width }) => {
    const itemRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const zIndex = useAppSelector((state) => {
        return state.workspace.currentMaxZIndex;
    });

    useEffect(() => {
        const itemElement = itemRef.current;
        invariant(itemElement, "Item element is not defined");
        return draggable({
            element: itemElement,
            getInitialData: () => ({
                status: "NEW",
                type: type,
                width,
                height
            }),
            onDragStart: () => {
                setIsDragging(true);
            },
            onDrop: () => {
                setIsDragging(false);
            },
            onGenerateDragPreview: ({ nativeSetDragImage }) => {
                setCustomNativeDragPreview({
                    getOffset: () => ({ x: PREVIEW_OFFSET_X, y: PREVIEW_OFFSET_Y }),
                    render({ container }) {
                        const root = createRoot(container);
                        root.render(<Provider store={store}><BaseCard preview={true} Component={Note} cardData={{id: "foo", type: "note", height, width, zIndex }}></BaseCard></Provider>);
                        return () => {
                            root.unmount();
                        };
                    },
                    nativeSetDragImage
                })
            }
        });
    });
    return (
        <div className="palette-item" ref={itemRef} data-testid={`palette-item-${type}`}>
            <div className={`palette-item-content ${type}-palette-item ${isDragging ? "isDragging" : ""}`}>
                <div>
                    <Icon />
                </div>
                <p>{label}</p>
            </div>
        </div>
    );
};

export default PaletteItem;