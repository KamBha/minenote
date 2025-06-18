import type { Edge } from "../../global";

const DropIndicator = ({ edge, gap }: 
    { edge: Edge | null, gap: string }
) => {
    const edgeClassMap = {
        top: "edge-top",
        bottom: "edge-bottom"
    };
    let edgeValue = edge;
    if (edge && !edgeClassMap.hasOwnProperty(edge)) {
        edgeValue = "top";
    }

    // @ts-ignore
    const edgeClass = edgeClassMap[edgeValue];

    const style: React.CSSProperties & { [key: string]: string } = {
        "--gap": gap
    };

    return <div className={`drop-indicator ${edgeClass}`} style={style}></div>;
};

export default DropIndicator;