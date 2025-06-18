import { draggable } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import React, { useEffect, useRef, useState } from "react";
import invariant from "tiny-invariant";
import { Provider } from "react-redux";
import { createRoot } from "react-dom/client";
import { setCustomNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview';
import CardContainer from "../cards/CardContainer";
import store, { useAppSelector } from "../workspace/workspaceStore";
import { PREVIEW_OFFSET_X, PREVIEW_OFFSET_Y } from "../../constants";
import { CardStatus, type CardBase, type DragCardData } from "../../global";
import { type CardType } from "../../shared/workspaceTypes";


interface PaletteItemProps {
    Icon: React.FC<React.SVGProps<SVGSVGElement>>;
    Component: React.FC<CardBase>;
    label: string;
    type: CardType;
    defaultHeight: number;
    defaultWidth: number;
}

const PaletteItem: React.FC<PaletteItemProps> = ({ Icon, Component, label, type, defaultHeight:height, defaultWidth:width }) => {
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
            getInitialData: (): DragCardData => ({
                status: CardStatus.NEW,
                type,
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
                        root.render(<Provider store={store}><CardContainer preview={true} Component={Component} cardData={{id: "foo", type: "note", height, width, zIndex }}></CardContainer></Provider>);
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