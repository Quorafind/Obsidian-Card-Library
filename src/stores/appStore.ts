import combineReducers from '@/lib/combineReducers';
import createStore from '@/lib/createStore';
import * as globalStore from '@/stores/globalStateStore';
import * as locationStore from '@/stores/locationStore';
import * as cardStore from '@/stores/cardStore';
import * as queryStore from '@/stores/queryStore';
import * as fileStore from '@/stores/fileStore';

interface AppState {
    globalState: globalStore.State;
    locationState: locationStore.State;
    cardState: cardStore.State;
    queryState: queryStore.State;
    fileState: fileStore.State;
}

type AppStateActions =
    | globalStore.Actions
    | locationStore.Actions
    | cardStore.Actions
    | queryStore.Actions
    | fileStore.Actions;

export const appStore = createStore<AppState, AppStateActions>(
    {
        globalState: globalStore.defaultState,
        locationState: locationStore.defaultState,
        cardState: cardStore.defaultState,
        queryState: queryStore.defaultState,
        fileState: fileStore.defaultState,
    },
    combineReducers<AppState, AppStateActions>({
        globalState: globalStore.reducer,
        locationState: locationStore.reducer,
        cardState: cardStore.reducer,
        queryState: queryStore.reducer,
        fileState: fileStore.reducer,
    }),
);

export default appStore;
