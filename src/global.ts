import type { CardData, CardType, ID } from "./shared/workspaceTypes";


export type Edge = "top" | "bottom";

export const CardStatus = {
    NEW: "NEW",
    EXISTING: "EXISTING"
} as const;
export type CardStatus = typeof CardStatus[keyof typeof CardStatus];

export type DragCardData = Partial<CardData> & {
    status: CardStatus;
    id?: ID;
    width: number;
    height: number;
    topOffset?: number;
    leftOffset?: number;
    type: CardType;
}

export interface CardBase {
    preview: boolean;
    cardData: CardData;
};