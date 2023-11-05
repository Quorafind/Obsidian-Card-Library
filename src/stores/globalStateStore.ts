import { App, MarkdownEditor, PluginManifest } from 'obsidian';
import { CardLibraryView } from '@/cardLibraryIndex';
import { CardLibrarySettings } from '@/types/settings';

export type ViewStatus = 'lg' | 'md' | 'sm';

export interface AppSetting {
  manifest: PluginManifest | null;
  settings: CardLibrarySettings;
  app: App;
  view: CardLibraryView;
  editor: MarkdownEditor;
  focused: boolean;
}

export interface State extends AppSetting {
  colorScheme: string;
  editCardId: string;
  viewStatus: string;
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
  SET_VIEW_STATUS: {
    viewStatus: string;
  };
  SET_FOCUSED: {
    focused: boolean;
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
  SET_EDITOR: {
    editor: MarkdownEditor;
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
    case 'SET_VIEW_STATUS': {
      if (action.payload.viewStatus === state.viewStatus) {
        return state;
      }

      return {
        ...state,
        viewStatus: action.payload.viewStatus,
      };
    }
    case 'SET_FOCUSED': {
      if (action.payload.focused === state.focused) {
        return state;
      }

      return {
        ...state,
        focused: action.payload.focused,
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
    case 'SET_EDITOR': {
      if (action.payload.editor === state.editor) {
        return state;
      }

      return {
        ...state,
        editor: action.payload.editor,
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
  editor: null,
  editCardId: '',
  focused: false,
  viewStatus: 'lg',
  changedBySelf: false,
  manifest: null,
};
