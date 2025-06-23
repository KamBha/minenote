import Note from "./implementations/note/Note";
import Column from "./implementations/column/Column";
import { default as NoteIcon }  from "../../assets/notes.svg?react";
import { default as ColumnIcon }  from "../../assets/column.svg?react";
import type React from "react";
import type { CardData } from "../../shared/workspaceTypes";
import { createId } from "../workspace/idGenerator";
import type { CardType } from "../../shared/workspaceTypes";
import type { CardBase } from "../../global";


type RegistryType = {
    [key in CardType]: {
        widget: React.FC<CardBase>,
        icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>,
        label: string,
        defaultHeight: number,
        defaultWidth: number,
        allowHeightSet: boolean,
        isContainer?: boolean,
        create: (commonData: CardData) => Array<CardData>
    };
};

const noteCreate = (commonData: CardData) => {
    return [ { ...commonData, content: null } ];
};

const columnCreate = (commonData: CardData) => {
    const note = noteCreate({ ...commonData, id: createId(), parent: commonData.id, type: "note" })[0];
    return [ note, { ...commonData, content: { title: "New Column", children: [] } } ];
};

const registry: RegistryType  = {
    "note": {
        widget: Note,
        icon: NoteIcon,
        label: "Note",
        defaultHeight: 144,
        defaultWidth: 240,
        allowHeightSet: true,
        create: noteCreate
    },
    "column": {
        widget: Column,
        icon: ColumnIcon,
        label: "Column",
        defaultHeight: 120,
        defaultWidth: 320,
        allowHeightSet: false,
        isContainer: true,
        create: columnCreate
    }
};

const retrieveCardTypeDetails = (cardType: CardType) => registry[cardType];

export default retrieveCardTypeDetails;