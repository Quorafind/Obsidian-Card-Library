import appStore from '../stores/appStore';
import { App, MarkdownEditor, PluginManifest } from 'obsidian';
import { CardLibrarySettings } from '@/types/settings';
import { CardLibraryView } from '@/cardLibraryView';

class GlobalService {
  public getState = () => {
    return appStore.getState().globalState;
  };

  public setEditCardId = (editCardId: string) => {
    console.log(editCardId);
    appStore.dispatch({
      type: 'SET_EDIT_CARD_ID',
      payload: {
        editCardId,
      },
    });
  };

  public setSidebarEditCardId = (sidebarEditCardId: string) => {
    appStore.dispatch({
      type: 'SET_SIDEBAR_EDIT_CARD_ID',
      payload: {
        sidebarEditCardId,
      },
    });
  };

  public setCopyCardId = (copyCardIds: string[]) => {
    appStore.dispatch({
      type: 'SET_COPY_CARD_IDS',
      payload: {
        copyCardIds,
      },
    });
  };

  public setFocused = (focused: boolean) => {
    appStore.dispatch({
      type: 'SET_FOCUSED',
      payload: {
        focused,
      },
    });
  };

  public setViewHeaderVisibility = (visible: boolean) => {
    appStore.dispatch({
      type: 'SET_VIEW_HEADER_VISIBILITY',
      payload: {
        visible,
      },
    });
  };

  public setHasCanvasViewOpened = (hasCanvasViewOpened: boolean) => {
    appStore.dispatch({
      type: 'SET_HAS_CANVAS_VIEW_OPENED',
      payload: {
        hasCanvasViewOpened,
      },
    });
  };

  public setViewStatus = (viewStatus: string) => {
    appStore.dispatch({
      type: 'SET_VIEW_STATUS',
      payload: {
        viewStatus,
      },
    });
  };

  public setChangedByCardLibrary = (changedBySelf: boolean) => {
    appStore.dispatch({
      type: 'SET_CHANGED_BY_SELF',
      payload: {
        changedBySelf,
      },
    });
  };

  public setApp = (app: App) => {
    appStore.dispatch({
      type: 'SET_APP',
      payload: {
        app,
      },
    });
  };

  public setView = (view: CardLibraryView) => {
    appStore.dispatch({
      type: 'SET_VIEW',
      payload: {
        view,
      },
    });
  };

  public setSetting = (settings: CardLibrarySettings) => {
    appStore.dispatch({
      type: 'SET_SETTING',
      payload: {
        settings,
      },
    });
  };

  public setEditor = (editor: MarkdownEditor) => {
    appStore.dispatch({
      type: 'SET_EDITOR',
      payload: {
        editor,
      },
    });
  };

  public setPluginManifest = (pluginManifest: PluginManifest) => {
    appStore.dispatch({
      type: 'SET_PLUGIN_MANIFEST',
      payload: {
        manifest: pluginManifest,
      },
    });
  };
}

const globalService = new GlobalService();

export default globalService;
