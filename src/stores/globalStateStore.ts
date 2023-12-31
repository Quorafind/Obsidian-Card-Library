import { App, MarkdownEditor, PluginManifest } from 'obsidian';
import { CardLibrarySettings } from '@/types/settings';
import { CardLibraryView } from '@/cardLibraryView';

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
  sidebarEditCardId: string;
  editCardId: string;
  copyCardIds: string[];
  viewStatus: string;
  changedBySelf: boolean;
  viewHeaderVisibility: boolean;
  hasCanvasViewOpened: boolean;
}

interface Action<T extends string, P> {
  type: T;
  payload: P;
}

type ActionPayloads = {
  SET_EDIT_CARD_ID: {
    editCardId: string;
  };
  SET_SIDEBAR_EDIT_CARD_ID: {
    sidebarEditCardId: string;
  };
  SET_COPY_CARD_IDS: {
    copyCardIds: string[];
  };
  SET_VIEW_HEADER_VISIBILITY: {
    visible: boolean;
  };
  SET_HAS_CANVAS_VIEW_OPENED: {
    hasCanvasViewOpened: boolean;
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
  CLEAR_CARDS: null;
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
    case 'SET_COPY_CARD_IDS': {
      if (action.payload.copyCardIds === state.copyCardIds) {
        return state;
      }

      return {
        ...state,
        copyCardIds: action.payload.copyCardIds,
      };
    }
    case 'SET_HAS_CANVAS_VIEW_OPENED': {
      if (action.payload.hasCanvasViewOpened === state.hasCanvasViewOpened) {
        return state;
      }
      return {
        ...state,
        hasCanvasViewOpened: action.payload.hasCanvasViewOpened,
      };
    }
    case 'SET_VIEW_HEADER_VISIBILITY': {
      if (action.payload.visible === state.viewHeaderVisibility) {
        return state;
      }

      return {
        ...state,
        viewHeaderVisibility: action.payload.visible,
      };
    }
    case 'SET_SIDEBAR_EDIT_CARD_ID': {
      if (action.payload.sidebarEditCardId === state.sidebarEditCardId) {
        return state;
      }

      return {
        ...state,
        sidebarEditCardId: action.payload.sidebarEditCardId,
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
        changedBySelf: action.payload.changedBySelf,
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
  copyCardIds: [],
  viewHeaderVisibility: true,
  hasCanvasViewOpened: false,
  sidebarEditCardId: '',
  focused: false,
  viewStatus: 'lg',
  changedBySelf: false,
  manifest: null,
};
