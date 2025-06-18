import type { CardData, BaseCardData } from "../../shared/workspaceTypes";
import { createId } from "../workspace/idGenerator";
import retrieveCardTypeDetails from "./cardRegistry";

export const createCard = (commonCardInfo: BaseCardData): Array<CardData> => {
    return retrieveCardTypeDetails(commonCardInfo.type).create({
        ...commonCardInfo,
        id: createId()
    });
};