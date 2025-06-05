export type CardType = "note";

export type AddNewCard = {
    type: CardType;
    width: number;
    height: number;
    left?: number; 
    top?: number;
};

export type HasId = {
    id: string
}

export type CardData = AddNewCard & HasId & {
    content?: string | null;
    zIndex?: number;
};

export type WorkspaceData = HasId & {
    id: string;
    description: string;
    cards: {
        [key:string]: CardData
    };
    currentMaxZIndex: number
};

export type MoveCard = HasId & {
    id: string;
    left: number; 
    top: number;
};

export type DeleteCard = HasId;

export type ResizeCard = HasId & {
    id: string,
    height: number,
    width: number
}