import { App, PluginManifest } from 'obsidian';
import { CardLibraryView } from '@/cardLibraryIndex';
import { CardLibrarySettings } from '@/types/settings';

export interface AppSetting {
  manifest: PluginManifest | null;
  settings: CardLibrarySettings;
  app: App;
  view: CardLibraryView;
}

export interface State extends AppSetting {
  colorScheme: string;
  editCardId: string;
  isMobileView: boolean;
  changedBySelf: boolean;
}

interface Action<T extends string, P> {
  type: T;
  payload: P;
}

type ActionPayloads = {
  SET_EDIT_CARD_ID: {
    editCardId: string;
  };
  SET_MOBILE_VIEW: {
    isMobileView: boolean;
  };
  SET_CHANGED_BY_SELF: {
    changedBySelf: boolean;
  };
  SET_APP: {
    app: App;
  };
  SET_VIEW: {
    view: CardLibraryView;
  };
  SET_SETTING: {
    settings: CardLibrarySettings;
  };
  SET_PLUGIN_MANIFEST: {
    manifest: PluginManifest;
  };
  CLEAR_MEMOS: null;
};

export type Actions = {
  [K in keyof ActionPayloads]: Action<K, ActionPayloads[K]>;
}[keyof ActionPayloads];

export function reducer(state: State, action: Actions) {
  switch (action.type) {
    case 'SET_EDIT_CARD_ID': {
      if (action.payload.editCardId === state.editCardId) {
        return state;
      }

      return {
        ...state,
        editCardId: action.payload.editCardId,
      };
    }
    case 'SET_MOBILE_VIEW': {
      if (action.payload.isMobileView === state.isMobileView) {
        return state;
      }

      return {
        ...state,
        isMobileView: action.payload.isMobileView,
      };
    }
    case 'SET_APP': {
      if (action.payload.app === state.app) {
        return state;
      }

      return {
        ...state,
        app: action.payload.app,
      };
    }
    case 'SET_VIEW': {
      if (action.payload.view === state.view) {
        return state;
      }

      return {
        ...state,
        view: action.payload.view,
      };
    }

    case 'SET_CHANGED_BY_SELF': {
      if (action.payload.changedBySelf === state.changedBySelf) {
        return state;
      }

      return {
        ...state,
        changedByMemos: action.payload.changedBySelf,
      };
    }
    case 'SET_PLUGIN_MANIFEST': {
      return {
        ...state,
        manifest: action.payload.manifest,
      };
    }
    case 'SET_SETTING': {
      return {
        ...state,
        settings: action.payload.settings,
      };
    }
    default: {
      return state;
    }
  }
}

export const defaultState: State = {
  colorScheme: 'default',
  settings: null,
  app: null,
  view: null,
  editCardId: '',
  isMobileView: false,
  changedBySelf: false,
  manifest: null,
};
