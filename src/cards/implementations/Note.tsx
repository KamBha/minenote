import React from "react";
import type { CardBase } from "../../global";

interface NoteProps  extends  CardBase {
    
}

const Note = ({ preview } : NoteProps) => {
    return (
        <div className={`note-card ${preview ? "preview" : ""}`}>
            <p>This is a Note card.</p>
        </div>
    );
};

export default Note;