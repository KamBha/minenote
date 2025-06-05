import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { type WorkspaceData, type AddNewCard, type MoveCard, type DeleteCard, type ResizeCard, type HasId } from "../../shared/workspace"
import { createId } from "./idGenerator";

const initialState: WorkspaceData = {
    id: "foo",
    description: "",
    cards: {
    },
    currentMaxZIndex: 1
};

const updateExistingCard = <T extends HasId>(state: WorkspaceData, action: PayloadAction<T>) => {
    state.cards[action.payload.id] = {
        ...state.cards[action.payload.id],
        ...action.payload,
        zIndex: state.currentMaxZIndex
    }
    state.currentMaxZIndex += 1;
};

export const workspaceSlice = createSlice({
    name: "workspace",
    initialState,
    reducers: {
        addCard: (state, action: PayloadAction<AddNewCard>) => {
            const id = createId();
            state.cards[id] = {
                ...action.payload,
                id,
                zIndex: state.currentMaxZIndex,
                content: null
            };
            state.currentMaxZIndex += 1;
        },
        moveCard: (state, action: PayloadAction<MoveCard>) => {
            updateExistingCard<MoveCard>(state, action);
        },
        deleteCard: (state, action: PayloadAction<DeleteCard>) => {
            delete state.cards[action.payload.id];
        },
        resizeCard: (state, action: PayloadAction<ResizeCard>) => {
            updateExistingCard<ResizeCard>(state, action);
        }
    },
});

export const workspaceReducer = workspaceSlice.reducer;

export const { addCard, moveCard, deleteCard, resizeCard } = workspaceSlice.actions;