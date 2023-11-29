export type State = AppLocation;

type ActionPayloads = {
  SET_LOCATION: State;
  SET_PATHNAME: {
    pathname: string;
  };
  SET_QUERY: Query;
  SET_QUERY_FILTER: string;
  SET_TAG_QUERY: {
    tags: string[];
  };
  SET_QUERY_WITH_TYPE: {
    target: QueryType;
    value: CardSpecType[] | string[] | boolean[];
  };
  SET_TYPE: {
    type: CardSpecType[] | [];
  };
  SET_TEXT: {
    text: string;
  };
  SET_HASH: {
    hash: string;
  };
  SET_SPEC_PATH: {
    specPath: '' | 'archive' | 'starred' | 'trash';
  };
};

export type Actions = {
  [K in keyof ActionPayloads]: Action<K, ActionPayloads[K]>;
}[keyof ActionPayloads];

export function reducer(state: State, action: Actions) {
  switch (action.type) {
    case 'SET_LOCATION': {
      return action.payload;
    }
    case 'SET_PATHNAME': {
      if (action.payload.pathname === state.pathname) {
        return state;
      }

      return {
        ...state,
        pathname: action.payload.pathname,
      };
    }
    case 'SET_HASH': {
      if (action.payload.hash === state.hash) {
        return state;
      }

      return {
        ...state,
        hash: action.payload.hash,
      };
    }
    case 'SET_QUERY': {
      return {
        ...state,
        query: {
          ...action.payload,
        },
      };
    }
    case 'SET_TAG_QUERY': {
      if (action.payload.tags === state.query.tags) {
        return state;
      }

      return {
        ...state,
        query: {
          ...state.query,
          tags: action.payload.tags,
        },
      };
    }
    case 'SET_QUERY_WITH_TYPE': {
      const { target, value } = action.payload;
      const { query } = state;
      if (target === 'tags') {
        if (value === query.tags) {
          return state;
        }

        return {
          ...state,
          query: {
            ...query,
            tags: value as string[],
          },
        };
      } else if (target === 'color') {
        if (value === query.color) {
          return state;
        }

        return {
          ...state,
          query: {
            ...query,
            color: value as string[],
          },
        };
      } else if (target === 'type') {
        if (value === query.type) {
          return state;
        }

        return {
          ...state,
          query: {
            ...query,
            type: value as CardSpecType[],
          },
        };
      } else if (target === 'linked') {
        if (value === query.linked) {
          return state;
        }

        return {
          ...state,
          query: {
            ...query,
            linked: value as string[],
          },
        };
      } else if (target === 'path') {
        if (value === query.path) {
          return state;
        }

        return {
          ...state,
          query: {
            ...query,
            path: value as string[],
          },
        };
      }
      break;
    }
    case 'SET_TYPE': {
      if (action.payload.type === state.query.type) {
        return state;
      }

      return {
        ...state,
        query: {
          ...state.query,
          type: action.payload.type,
        },
      };
    }
    case 'SET_TEXT': {
      if (action.payload.text === state.query.text) {
        return state;
      }

      return {
        ...state,
        query: {
          ...state.query,
          text: action.payload.text,
        },
      };
    }
    case 'SET_SPEC_PATH': {
      if (action.payload.specPath === state.query.specPath) {
        return state;
      }

      return {
        ...state,
        query: {
          ...state.query,
          specPath: action.payload.specPath,
        },
      };
    }
    case 'SET_QUERY_FILTER': {
      if (action.payload === state.query.filter) {
        return state;
      }

      return {
        ...state,
        query: {
          ...state.query,
          filter: action.payload,
        },
      };
    }
    default: {
      return state;
    }
  }
}

export const defaultState: State = {
  pathname: '/',
  hash: '',
  query: {
    tags: [],
    type: [],
    color: [],
    linked: [],
    path: [],
    text: '',
    filter: '',
    specPath: '',
  },
};
