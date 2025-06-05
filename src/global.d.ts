import type { ReactElement } from "react";
import type { CardData } from "./shared/workspace";


export type BoardData = {
    [key: string]: ColumnData;
};

export type Edge = "top" | "right" | "bottom" | "left";


interface CardBase {
    preview: boolean;
    cardData: CardData;
};