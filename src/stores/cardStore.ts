import utils from '@/lib/helper';
import { moment } from "obsidian";

export interface State {
    cards: Model.Card[];
    tags: string[];
    tagsNum: { [key: string]: number };
    colors: string[];
}

type ActionPayloads = {
    SET_CARDS: {
        cards: Model.Card[]
    };
    SET_TAGS: {
        tags: string[],
        tagsNum: { [key: string]: number }
    };
    INSERT_CARD: {
        card: Model.Card
    };
    ARCHIVE_CARD_BY_ID: Model.Card;
    UNARCHIVE_CARD_BY_ID: Model.Card;
    DELETE_CARD_BY_ID: {
        id: string
    };
    DELETE_CARD_BY_ID_BATCH: {
        ids: string[]
    };
    UPDATE_CARD_BATCH: {
        cards: Model.Card[];
        path: string
    };
    EDIT_CARD: Model.Card;
    EDIT_CARD_PATH: Model.Card;
    PIN_CARD: Model.Card;
    CLEAR_MEMOS: null;
};

export type Actions = {
    [K in keyof ActionPayloads]: Action<K, ActionPayloads[K]>
}[keyof ActionPayloads];


export function reducer(state: State, action: Actions): State {
    switch (action.type) {
        case 'SET_CARDS': {
            const sortedMemos = action.payload.cards.sort(
                (a, b) => moment(b.createdAt).unix() - moment(a.createdAt).unix(),
            );

            const memos = utils.dedupeObjectWithId(sortedMemos);

            return {
                ...state,
                cards: [...memos],
            };
        }
        case 'SET_TAGS': {
            return {
                ...state,
                tags: action.payload.tags,
                tagsNum: action.payload.tagsNum,
            };
        }
        case 'INSERT_CARD': {
            const cards = utils.dedupeObjectWithId(
                [action.payload.card, ...state.cards].sort(
                    (a, b) => moment(b.createdAt).unix() - moment(a.createdAt).unix(),
                ),
            );

            return {
                ...state,
                cards,
            };
        }
        case 'DELETE_CARD_BY_ID': {
            return {
                ...state,
                cards: [...state.cards].filter((card) => card.id !== action.payload.id),
            };
        }
        case 'DELETE_CARD_BY_ID_BATCH': {
            const tempMemos = [...state.cards];
            action.payload.ids.forEach((id) => {
                tempMemos.splice(
                    tempMemos.findIndex((m) => m.id === id),
                    1,
                );
            });

            return {
                ...state,
                cards: [...tempMemos],
            };
        }
        case 'CLEAR_MEMOS': {
            return {
                ...defaultState,
            };
        }
        case 'EDIT_CARD': {
            const memos = state.cards.map((m) => {
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
                cards: [...memos],
            };
        }
        case 'EDIT_CARD_PATH': {
            const memos = state.cards.map((m) => {
                if (m.path === action.payload.path) {
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
                cards: [...memos],
            };
        }
        case 'UPDATE_CARD_BATCH': {
            const memosWithOutSamePath = state.cards.filter((m) => m.path !== action.payload.path);

            const memos = utils.dedupeObjectWithId(
                [...action.payload.cards, ...memosWithOutSamePath].sort(
                    (a, b) => moment(b.createdAt).unix() - moment(a.createdAt).unix(),
                ),
            );
            return {
                ...state,
                cards: [...memos],
            };
        }
        case 'ARCHIVE_CARD_BY_ID': {
            const memos = state.cards.map((m) => {
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
                cards: [...memos],
            };
        }
        case 'UNARCHIVE_CARD_BY_ID': {
            const memos = state.cards.map((m) => {
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
                cards: [...memos],
            };
        }
        case 'PIN_CARD': {
            const memos = state.cards.map((m) => {
                if (m.id === action.payload.id) {
                    return {
                        ...m,
                        pinned: action.payload.pinned,
                    };
                } else {
                    return m;
                }
            });

            return {
                ...state,
                cards: [...memos],
            };
        }
        default: {
            return state;
        }
    }
}

export const defaultState: State = {
    cards: [],
    tags: [],
    colors: [],
    tagsNum: {} as { [key: string]: number }
};
