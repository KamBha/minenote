export type CardType = "note" | "column";
export type ID = string;

export type BaseCardData =  {
    type: CardType;
    width: number;
    height: number;
    left?: number;
    top?: number;
};

export type HasId = {
    id: ID
};

export type CardData = BaseCardData & HasId & {
    content?: any;
    parent?: null | ID;
    zIndex?: number;
    position?: number | null;
};

export type AddNewCards = CardData[];

export type WorkspaceData = HasId & {
    description: string;
    cards: {
        [key:string]: CardData
    };
    currentMaxZIndex: number
};

export type MoveCard = HasId & {
    left: number; 
    top: number;
    parent?: null | ID;
    position?: number | null
};

export type DeleteCard = HasId;

export type ResizeCard = HasId & {
    height: number,
    width: number
}

export type HasChildrenIds = {
    children: Array<ID>
}

export type ColumnContent = HasChildrenIds & {
    title: string
};