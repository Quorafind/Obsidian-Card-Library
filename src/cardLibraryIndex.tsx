import { ButtonComponent, ItemView, Menu, Notice, Plugin, WorkspaceLeaf } from 'obsidian';
import '@/less/globals.less';
import { CardLibrarySettingTab, DEFAULT_SETTINGS } from '@/cardLibrarySettings';
import { cardService, globalService, locationService } from '@/services';
import { CardLibrarySettings } from '@/types/settings';
import { KeyEvent, modKeys, ribbonCommandsList, TargetLocation } from '@/types/obsidian';
import { patchEditor } from '@/lib/patchEditor';
import { CardLibraryView, VIEW_TYPE } from '@/cardLibraryView';
import { around } from 'monkey-around';

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
    shortName: 'Left sidebar',
    name: 'Open card library in left sidebar',
    icon: 'arrow-left',
    location: 'left',
    cb: openCardLibraryCb,
    modKeys: 'shift',
  },
  {
    id: 'open-card-library-in-right-sidebar',
    shortName: 'Right sidebar',
    name: 'Open card library in right sidebar',
    icon: 'arrow-right',
    location: 'right',
    cb: openCardLibraryCb,
    modKeys: ['ctrl', 'meta'],
  },
  {
    id: 'open-card-library-in-float',
    shortName: 'Float window',
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

export default class CardLibrary extends Plugin {
  private view: CardLibraryView;
  settings: CardLibrarySettings;
  settingTab: CardLibrarySettingTab;

  private idSet = new Set<string>();
  private actionEls = [];

  async onload(): Promise<void> {
    await this.initSettings();

    this.initEditor();
    this.initCommands();
    this.initRibbon();

    this.patchCanvasMenu();
    this.patchCanvas();

    this.registerView(VIEW_TYPE, (leaf: WorkspaceLeaf) => (this.view = new CardLibraryView(leaf)));

    this.app.workspace.onLayoutReady(this.onLayoutReady.bind(this));
  }

  onunload(): void {
    super.onunload();
    this.actionEls.forEach((el) => el.detach());
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

  initRibbon(): void {
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

  patchCanvasHeader(): void {
    const addLibraryActionToLeaf = (leaf) => {
      if (!this.idSet.has(leaf.id)) {
        this.idSet.add(leaf.id);

        const itemView = leaf.view as ItemView;
        const actionElement = itemView.addAction('library', 'Open card library', async () => {
          try {
            const newLeaf = this.app.workspace.getLeaf('split');
            if (newLeaf) {
              await newLeaf.setViewState({ type: VIEW_TYPE });
              this.app.workspace.revealLeaf(newLeaf);
              locationService.setQueryWithType('path', [leaf.view.file?.path ?? '']);
            }
          } catch (error) {
            console.error('Error adding library action:', error);
          }
        });

        this.actionEls.push(actionElement);
      }
    };

    const leaves = this.app.workspace.getLeavesOfType('canvas');
    if (leaves.length > 0) {
      leaves.forEach(addLibraryActionToLeaf);
    }

    this.registerEvent(
      this.app.workspace.on('active-leaf-change', (activeLeaf) => {
        if (activeLeaf.view.getViewType() === 'canvas') {
          addLibraryActionToLeaf(activeLeaf);
        }
      }),
    );
  }

  patchCanvasMenu(): void {
    const checkAndOpenCardLibrary = () => {
      if (!this.app.workspace.getLeavesOfType(VIEW_TYPE).length) {
        this.app.workspace.detachLeavesOfType(VIEW_TYPE);
        this.app.workspace.getLeaf('split')?.setViewState({ type: VIEW_TYPE });
      }
    };

    const patchMenu = () => {
      const canvasView = this.app.workspace.getLeavesOfType('canvas').first()?.view;
      if (!canvasView) return false;

      const menu = (canvasView as CanvasView)?.canvas.menu;
      if (!menu) return false;

      const selection = menu.selection;
      if (!selection) return false;

      const menuUninstaller = around(menu.constructor.prototype, {
        render: (next: any) =>
          function (...args: any) {
            const result = next.call(this, ...args);
            if (this.menuEl.querySelector('.card-library-menu-item')) return result;
            const currentSelection: Set<any> = this.canvas.selection;

            if (currentSelection.size === 0) return result;
            if (currentSelection.size > 1) return result;
            const node = currentSelection.values().next().value;

            const button = new ButtonComponent(this.menuEl);
            button.buttonEl.toggleClass('card-library-menu-item', true);
            button
              .setClass('clickable-icon')
              .setIcon('library')
              .setTooltip('Edit In Card Library', {
                placement: 'top',
              })
              .onClick(() => {
                checkAndOpenCardLibrary();

                locationService.setPathname('/editor');
                globalService.setSidebarEditCardId(node.id);
              });

            return result;
          },
      });

      this.register(menuUninstaller);

      console.log('Obsidian-Card-Library: card patched');
      return true;
    };

    this.app.workspace.onLayoutReady(() => {
      if (!patchMenu()) {
        const evt = this.app.workspace.on('layout-change', () => {
          patchMenu() && this.app.workspace.offref(evt);
        });
        this.registerEvent(evt);
      }
    });
  }

  patchCanvas(): void {
    const patchCanvas = () => {
      const canvasView = this.app.workspace.getLeavesOfType('canvas').first()?.view;
      if (!canvasView) return false;

      const canvas: any = (canvasView as any)?.canvas;
      if (!canvas) return false;

      const uninstaller = around(canvas.constructor.prototype, {
        selectOnly: (next: any) =>
          function (args: any) {
            if (globalService.getState().sidebarEditCardId) {
              globalService.setSidebarEditCardId(args?.id);
            }
            return next.call(this, args);
          },
      });
      this.register(uninstaller);

      console.log('Obsidian-Card-Library: canvas patched');
      return true;
    };

    this.app.workspace.onLayoutReady(() => {
      if (!patchCanvas()) {
        const evt = this.app.workspace.on('layout-change', () => {
          patchCanvas() && this.app.workspace.offref(evt);
        });
        this.registerEvent(evt);
      }
    });
  }

  async onLayoutReady(): Promise<void> {
    this.patchCanvasHeader();

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
