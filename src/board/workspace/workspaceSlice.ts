import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { type WorkspaceData, type AddNewCards, type MoveCard, type DeleteCard, type ResizeCard, type HasId, type HasChildrenIds, type UpdateSelection, SelectionLevel, type ID } from "../../shared/workspaceTypes"
import retrieveCardTypeDetails from "../cards/cardRegistry";

const initialState: WorkspaceData = {
    id: "foo",
    description: "",
    cards: {
    },
    currentMaxZIndex: 1
};

// TODO: Handle exceptions and incorrect inputs

const updateExistingCard = <T extends HasId>(state: WorkspaceData, action: PayloadAction<T>) => {
    const currentState = state.cards[action.payload.id];
    if (state.currentMaxZIndex !== currentState.zIndex) {
        state.currentMaxZIndex += 1;
    }
    state.cards[action.payload.id] = {
        ...state.cards[action.payload.id],
        ...action.payload,
        zIndex: state.currentMaxZIndex
    }
};

export const workspaceSlice = createSlice({
    name: "workspace",
    initialState,
    reducers: {
        addCards(state, action: PayloadAction<AddNewCards>) {
            state.currentMaxZIndex += 1;
            action.payload.forEach((card) => {
                state.cards[card.id] = {
                    ...card,
                    zIndex: state.currentMaxZIndex,
                }
            });

            action.payload.forEach((card) => {
                if (!card.parent) {
                    return;
                }
                const parentContent = (state.cards[card.parent].content as HasChildrenIds);
                if (card.position! < parentContent.children.length) {
                    parentContent.children.splice(card.position!, 0, card.id);
                }
                else {
                    parentContent.children.push(card.id);
                }
            });
            let id = action.payload.find((card) => !card.parent)?.id ;
            if (!id) {
                id = action.payload[0].id;
            }
            state.selection = { id,  selectionLevel: SelectionLevel.EDITED };
        },
        moveCard(state, action: PayloadAction<MoveCard>) {
            const card = action.payload;
            const oldParentId = state.cards[card.id].parent;
            updateExistingCard<MoveCard>(state, action);
            if (state.selection?.id !== action.payload.id) {
                delete state.selection;
            }
            if (!card.parent) {
                return;
            }
            const parentContent = (state.cards[card.parent].content as HasChildrenIds);
            if (card.position! < parentContent.children.length) {
                parentContent.children.splice(card.position!, 0, card.id);
            }
            else {
                parentContent.children.push(card.id);
            }
            if (oldParentId) {
                const oldParent = (state.cards[oldParentId].content as HasChildrenIds);
                oldParent.children = oldParent.children.filter((cardId) => cardId !== card.id);
            }
        },
        deleteCard(state, action: PayloadAction<DeleteCard>) {
            const cardToDelete = state.cards[action.payload.id];
            const cardTypeDetails = retrieveCardTypeDetails(cardToDelete.type);
            if (cardTypeDetails.isContainer) {
                (cardToDelete.content as HasChildrenIds).children.forEach((cardId) => {
                    delete state.cards[cardId];
                });
            }
            delete state.cards[action.payload.id];
            delete state.selection;
        },
        resizeCard(state, action: PayloadAction<ResizeCard>) {
            updateExistingCard<ResizeCard>(state, action);
        },
        updateSelection(state, action: PayloadAction<UpdateSelection>) {
            if (!action.payload) {
                delete state.selection;
                return;
            }
            const id = action.payload.id;
            // A card is considered in edited state when it has been clicked twice in a row.
            const selectionLevel = state.selection?.id === id ? SelectionLevel.EDITED : SelectionLevel.SELECTED;
            state.selection = { id, selectionLevel };
            if (action.payload.extraSelectionData) {
                state.selection.extraSelectionData = action.payload.extraSelectionData;
            }
        },
        updateSelectionExtraData(state, action: PayloadAction<UpdateSelection>) {
            if (!action.payload) {
                return;
            }
            // TODO: Handle error scenario where user has specified ID not yet selected
            if (state.selection && action.payload.extraSelectionData) {
                state.selection.extraSelectionData = action.payload.extraSelectionData;
            }
        }
    },
});

export const workspaceReducer = workspaceSlice.reducer;

export const { addCards, moveCard, deleteCard, resizeCard, updateSelection, updateSelectionExtraData } = workspaceSlice.actions;;