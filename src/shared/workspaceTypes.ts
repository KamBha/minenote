export type CardType = "note" | "column";
export const SelectionLevel = {
    SELECTED: "SELECTED",
    EDITED: "EDITING"
} as const;
export type SelectionLevel = typeof SelectionLevel[keyof typeof SelectionLevel];
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

export type Selection = {
    id: ID;
    selectionLevel:  SelectionLevel;
    extraSelectionData?: any;
};

export type WorkspaceData = HasId & {
    description: string;
    cards: {
        [key:ID]: CardData
    };
    selection?: Selection;
    currentMaxZIndex: number
};

export type AddNewCards = CardData[];

export type MoveCard = HasId & {
    left: number; 
    top: number;
    parent?: null | ID;
    position?: number | null
};

export type DeleteCard = HasId;

export type ResizeCard = HasId & {
    height: number;
    width: number;
};

export type UpdateSelection = HasId & {
    extraSelectionData?: any;
} | null | undefined;

export type HasChildrenIds = {
    children: Array<ID>
}

export type ColumnContent = HasChildrenIds & {
    title: string
};