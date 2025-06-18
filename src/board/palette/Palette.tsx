import PaletteItem from "./PaletteItem";
import TrashContainer from "./TrashContainer";
import retrieveCardTypeDetails from "../cards/cardRegistry";
import type { CardType } from "../../shared/workspaceTypes";

const Palette = () => {
    const PALETTE_ORDER:CardType[] = ["note", "column"];
    return (
        <div className="palette">
            <div className="paletteItems">
                {PALETTE_ORDER.map((paletteItem) => {
                    const { icon, label, defaultHeight, defaultWidth, widget } = retrieveCardTypeDetails(paletteItem)
                    return(<PaletteItem key={paletteItem} Component={widget} Icon={icon} label={label} type={paletteItem} defaultHeight={defaultHeight} defaultWidth={defaultWidth}/>)
                })}
                
            </div>
            <TrashContainer/>
        </div>
    );
};

export default Palette;