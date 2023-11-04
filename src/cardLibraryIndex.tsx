import { ItemView, Menu, Notice, Plugin, WorkspaceLeaf } from 'obsidian';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '@/less/globals.less';
import { CardLibrarySettingTab, DEFAULT_SETTINGS } from '@/cardLibrarySettings';
import { cardService, globalService } from '@/services';
import { CardLibrarySettings } from '@/types/settings';
import { KeyEvent, modKeys, ribbonCommandsList, TargetLocation } from '@/types/obsidian';
import { t } from '@/translations/helper';
import { patchEditor } from '@/lib/patchEditor';

const openCardLibraryCb = () => {
  new Notice('Open card library successfully');
};

const isKeyEvent = (evt: any): evt is KeyEvent => {
  return (
    evt.ctrlKey !== undefined || evt.metaKey !== undefined || evt.shiftKey !== undefined || evt.altKey !== undefined
  );
};

const commandsList: ribbonCommandsList[] = [
  {
    id: 'open-card-library-in-left-sidebar',
    shortName: 'Left Sidebar',
    name: 'Open card library in left sidebar',
    icon: 'arrow-left',
    location: 'left',
    cb: openCardLibraryCb,
    modKeys: 'shift',
  },
  {
    id: 'open-card-library-in-right-sidebar',
    shortName: 'Right Sidebar',
    name: 'Open card library in right sidebar',
    icon: 'arrow-right',
    location: 'right',
    cb: openCardLibraryCb,
    modKeys: ['ctrl', 'meta'],
  },
  {
    id: 'open-card-library-in-float',
    shortName: 'Float Window',
    name: 'Open card library in float window',
    icon: 'layout',
    location: 'float',
    cb: openCardLibraryCb,
    modKeys: 'alt',
  },
  {
    id: 'open-card-library-in-center',
    shortName: 'Center',
    name: 'Open card library in center',
    icon: 'tv-2',
    location: 'center',
    cb: openCardLibraryCb,
    modKeys: undefined,
  },
];

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

  async handleResize() {
    const leaf = this.leaf;
    if (leaf && leaf.height !== 0) {
      console.log(leaf.width, leaf.height);
      globalService.setMobileView(leaf.width < 950);
      if (leaf.width > 950) {
        leaf.view.contentEl.classList.toggle('mobile-view', false);
        leaf.view.contentEl.classList.toggle('mobile-tiny-view', false);

        return;
      }

      if (leaf.width > 400) {
        leaf.view.contentEl.classList.toggle('mobile-view', true);
        leaf.view.contentEl.classList.toggle('mobile-tiny-view', false);
        return;
      }

      leaf.view.contentEl.classList.toggle('mobile-view', true);
      leaf.view.contentEl.classList.toggle('mobile-tiny-view', true);
    }
  }

  async onOpen(): Promise<void> {
    this.registerEvent(
      this.app.workspace.on('layout-change', () => {
        console.log('layout-change');
        this.handleResize();
      }),
    );
    this.registerEvent(
      this.app.workspace.on('resize', () => {
        this.handleResize();
      }),
    );

    this.contentEl.toggleClass('card-library', true);
    try {
      globalService.setView(this);

      this.root = ReactDOM.createRoot(this.contentEl);
      this.root.render(
        <React.StrictMode>
          <App />
        </React.StrictMode>,
      );
      await this.handleResize();
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

    this.initEditor();
    this.initCommands();
    this.initRibbon();
    this.registerView(VIEW_TYPE, (leaf: WorkspaceLeaf) => (this.view = new CardLibraryView(leaf)));

    this.app.workspace.onLayoutReady(this.onLayoutReady.bind(this));
  }

  initEditor(): void {
    patchEditor(this.app)();
  }

  initCommands(): void {
    commandsList.forEach((command: ribbonCommandsList) => {
      this.addCommand({
        id: command.id,
        name: command.name,
        callback: () => this.openCardLibrary(command.location, command.cb),
        hotkeys: [],
      });
    });
  }

  async openCardLibrary(location: TargetLocation = 'center', cb?: () => void) {
    const workspace = this.app.workspace;
    workspace.detachLeavesOfType(VIEW_TYPE);
    let leaf: WorkspaceLeaf;

    switch (location) {
      case 'left':
        leaf = workspace.getLeftLeaf(false);
        break;
      case 'right':
        leaf = workspace.getRightLeaf(false);
        break;
      case 'float':
        leaf = workspace.getLeaf('window');
        break;
      default:
        leaf = workspace.getLeaf(true);
        break;
    }

    if (leaf) {
      await leaf.setViewState({ type: VIEW_TYPE });
      workspace.revealLeaf(leaf);
    }

    cb?.();
  }

  initRibbon() {
    this.addRibbonIcon('library', 'Card library', async (evt) => {
      if (evt.button === 2) {
        evt.preventDefault();
        const menu = new Menu();
        commandsList.forEach((command) => {
          menu.addItem((item) => {
            item
              .setTitle(command.shortName)
              .setIcon(command.icon)
              .onClick(async () => {
                await this.openCardLibrary(command.location, command.cb);
              });
          });
        });
        menu.showAtMouseEvent(evt);
        return;
      }

      for (let i = 0; i < commandsList.length; i++) {
        const command: ribbonCommandsList = commandsList[i];

        if (!command.modKeys) {
          await this.openCardLibrary(command.location, command.cb);
          break;
        }

        if (!isKeyEvent(evt)) continue;

        const modKeyPressed = (key: modKeys) => evt[`${key}Key`];

        if (
          (typeof command.modKeys === 'string' && modKeyPressed(command.modKeys)) ||
          (Array.isArray(command.modKeys) && command.modKeys.some(modKeyPressed))
        ) {
          console.log(command.location);
          await this.openCardLibrary(command.location, command.cb);
          break;
        }
      }
    });
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
