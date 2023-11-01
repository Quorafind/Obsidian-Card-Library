import appStore from '../stores/appStore';
import { App, PluginManifest } from 'obsidian';
import { CardLibraryView } from '@/cardLibraryIndex';
import { CardLibrarySettings } from '@/types/settings';

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

  public setMobileView = (isMobileView: boolean) => {
    appStore.dispatch({
      type: 'SET_MOBILE_VIEW',
      payload: {
        isMobileView,
      },
    });
  };

  public setChangedByMemos = (changedBySelf: boolean) => {
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
