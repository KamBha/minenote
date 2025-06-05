
import type { CardType } from "../shared/workspace";
import type { CardBase } from "../global";
import Note from "./implementations/Note";
import { default as NoteIcon }  from "../assets/notes.svg?react";
import type React from "react";

type RegistryType = {
    [key in CardType]: {
        widget: React.FC<CardBase>,
        icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>,
        label: string,
        defaultHeight: number,
        defaultWidth: number
    };
};

const registry: RegistryType  = {
    "note": {
        widget: Note,
        icon: NoteIcon,
        label: "Note",
        defaultHeight: 144,
        defaultWidth: 240
    }
};

const determineCard = (cardType: CardType) => registry[cardType];

export default determineCard;