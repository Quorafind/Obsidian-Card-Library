import { ItemView, Plugin, WorkspaceLeaf } from 'obsidian';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '@/less/globals.less';
import { CardLibrarySettingTab, DEFAULT_SETTINGS } from '@/cardLibrarySettings';
import { cardService, globalService } from '@/services';
import { CardLibrarySettings } from '@/types/settings';

export const VIEW_TYPE = 'card-library-view';

export class CardLibraryView extends ItemView {
  root: ReactDOM.Root;

  getViewType(): string {
    return VIEW_TYPE;
  }

  getDisplayText(): string {
    return 'Card Library';
  }

  getIcon(): string {
    return 'library';
  }

  async onOpen(): Promise<void> {
    this.contentEl.toggleClass('card-library', true);
    try {
      globalService.setView(this);

      this.root = ReactDOM.createRoot(this.contentEl);
      this.root.render(
        <React.StrictMode>
          <App />
        </React.StrictMode>,
      );
    } catch (e) {
      console.log(e);
    }
  }

  onunload(): void {
    super.onunload();
    this.root.unmount();
  }
}

export default class CardLibrary extends Plugin {
  private view: CardLibraryView;
  settings: CardLibrarySettings;
  settingTab: CardLibrarySettingTab;

  async onload(): Promise<void> {
    await this.initSettings();

    this.registerView(VIEW_TYPE, (leaf: WorkspaceLeaf) => (this.view = new CardLibraryView(leaf)));

    this.app.workspace.onLayoutReady(this.onLayoutReady.bind(this));
  }

  async initSettings(): Promise<void> {
    await this.loadSettings();
    this.settingTab = new CardLibrarySettingTab(this.app, this);
    this.addSettingTab(this.settingTab);
  }

  async onLayoutReady(): Promise<void> {
    globalService.setApp(this.app);
    globalService.setSetting(this.settings);
    globalService.setPluginManifest(this.manifest);

    await cardService.getCards();
    cardService.updateTagsState();
    await this.initView();
  }

  async initView() {
    if (this.app.workspace.getLeavesOfType(VIEW_TYPE).length) {
      return;
    }
    await this.app.workspace.getRightLeaf(false).setViewState({
      type: VIEW_TYPE,
    });
  }

  public async loadSettings(): Promise<void> {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    globalService.setSetting(this.settings);
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
    globalService.setSetting(this.settings);
  }
}
