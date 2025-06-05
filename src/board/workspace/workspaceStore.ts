import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { workspaceReducer } from "./workspaceSlice";
import { useDispatch, useSelector } from "react-redux";

const rootReducer = combineReducers({
    workspace: workspaceReducer
});

export function setupStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: rootReducer,
    preloadedState
  });
}

const store = configureStore({
    reducer: {
        workspace: workspaceReducer
    }
});

type RootState = ReturnType<typeof rootReducer>;
type AppDispatch = typeof store.dispatch;

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()
export default store;