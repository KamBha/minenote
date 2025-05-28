export type CardData = {
    id: number;
    type?: string;
    content: string;
    columnId?: string;
};

export type ColumnData = {
    columnId: string;
    title: string;
    cards: Array<CardData>;
};

export type BoardData = {
    [key: string]: ColumnData;
};