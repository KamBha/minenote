import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { type WorkspaceData, type AddNewCards, type MoveCard, type DeleteCard, type ResizeCard, type HasId, type HasChildrenIds } from "../../shared/workspaceTypes"
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
        addCards: (state, action: PayloadAction<AddNewCards>) => {
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
        },
        moveCard: (state, action: PayloadAction<MoveCard>) => {
            const card = action.payload;
            const oldParentId = state.cards[card.id].parent;
            updateExistingCard<MoveCard>(state, action);
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
                oldParent.children = oldParent.children.filter((cardId: ID) => cardId !== card.id);
            }

        },
        deleteCard: (state, action: PayloadAction<DeleteCard>) => {
            const cardToDelete = state.cards[action.payload.id];
            const cardTypeDetails = retrieveCardTypeDetails(cardToDelete.type);
            if (cardTypeDetails.isContainer) {
                (cardToDelete.content as HasChildrenIds).children.forEach((cardId: ID) => {
                    delete state.cards[cardId];
                });
            }
            delete state.cards[action.payload.id];
        },
        resizeCard: (state, action: PayloadAction<ResizeCard>) => {
            updateExistingCard<ResizeCard>(state, action);
        }
    },
});

export const workspaceReducer = workspaceSlice.reducer;

export const { addCards, moveCard, deleteCard, resizeCard } = workspaceSlice.actions;;