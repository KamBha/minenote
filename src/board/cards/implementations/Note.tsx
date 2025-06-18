import type { CardBase } from "../../../global";

interface NoteProps  extends  CardBase {
    
}

const Note = ({ preview, cardData } : NoteProps) => {
    return (
        <div className={`note-card ${preview ? "preview" : ""}`}>
            <p>This is a Note card. !{cardData.id}!</p>
        </div>
    );
};

export default Note;