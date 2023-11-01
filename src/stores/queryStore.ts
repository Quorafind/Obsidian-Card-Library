import utils from '@/lib/helper';
import { moment } from "obsidian";

export interface State {
    queries: Model.Query[];
}

interface Action<T extends string, P> {
    type: T;
    payload: P;
}

type ActionPayloads = {
    SET_QUERIES: {
        queries: Model.Query[]
    };
    INSERT_QUERY: {
        query: Model.Query
    };
    DELETE_QUERY_BY_ID: {
        id: string
    };
    UPDATE_QUERY: Model.Query
};

export type Actions = {
    [K in keyof ActionPayloads]: Action<K, ActionPayloads[K]>
}[keyof ActionPayloads];

export function reducer(state: State, action: Actions): State {
    switch (action.type) {
        case 'SET_QUERIES': {
            const queries = utils.dedupeObjectWithId(
                action.payload.queries
                    .sort((a, b) => moment(b.createdAt, 'x').unix() - moment(a.createdAt, 'x').unix())
                    .sort((a, b) => moment(b.pinnedAt, 'x').unix() - moment(a.pinnedAt, 'x').unix()),
            );

            return {
                ...state,
                queries,
            };
        }
        case 'INSERT_QUERY': {
            const queries = utils.dedupeObjectWithId(
                [action.payload.query, ...state.queries].sort(
                    (a, b) => moment(b.createdAt, 'x').unix() - moment(a.createdAt, 'x').unix(),
                ),
            );

            return {
                ...state,
                queries,
            };
        }
        case 'DELETE_QUERY_BY_ID': {
            return {
                ...state,
                queries: [...state.queries].filter((query) => query.id !== action.payload.id),
            };
        }
        case 'UPDATE_QUERY': {
            const queries = state.queries.map((m) => {
                if (m.id === action.payload.id) {
                    return {
                        ...m,
                        ...action.payload,
                    };
                } else {
                    return m;
                }
            });

            return {
                ...state,
                queries,
            };
        }
        default: {
            return state;
        }
    }
}

export const defaultState: State = {
    queries: [],
};
