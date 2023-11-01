import { TFile } from 'obsidian';

export interface State {
    files: TFile[];
}

type ActionPayloads = {
    SET_FILES: {
        files: TFile[]
    };
    CLEAR_FILES: null;
};

export type Actions = {
    [K in keyof ActionPayloads]: Action<K, ActionPayloads[K]>
}[keyof ActionPayloads];

export function reducer(state: State, action: Actions): State {
    switch (action.type) {
        case 'SET_FILES': {
            return {
                ...state,
                files: action.payload.files,
            };
        }
        case 'CLEAR_FILES': {
            return {
                ...state,
                files: null,
            };
        }
        default: {
            return state;
        }
    }
}

export const defaultState: State = {
    files: null,
};
