import PaletteItem from "./PaletteItem";
import TrashContainer from "./TrashContainer";
import determineCard from "../../cards/cardRegistry";
import type { CardType } from "../../shared/workspace";

const Palette = () => {
    const PALETTE_ORDER:CardType[] = ["note"];
    return (
        <div className="palette">
            <div className="paletteItems">
                {PALETTE_ORDER.map((paletteItem) => {
                    const { icon, label, defaultHeight, defaultWidth} = determineCard(paletteItem)
                    return(<PaletteItem key={paletteItem} Icon={icon} label={label} type={paletteItem} defaultHeight={defaultHeight} defaultWidth={defaultWidth}/>)
                })}
                
            </div>
            <TrashContainer/>
        </div>
    );
};

export default Palette;