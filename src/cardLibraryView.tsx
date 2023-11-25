import { debounce, ItemView, Scope, TFile, TFolder } from 'obsidian';
import ReactDOM from 'react-dom/client';
import { cardService, fileService, globalService, locationService } from '@/services';
import React from 'react';
import App from '@/App';
import { randomId, TYPE_TO_ORIGIN } from '@/lib/obsidianUtils';
import { CanvasNodeData } from 'obsidian/canvas';
import { queryIsEmptyOrBlank } from '@/lib/utils';
import appStore from '@/stores/appStore';
import appContext from '@/stores/appContext';
import Provider from '@/lib/Provider';
import { ViewHeader } from '@/components/containers/ViewHeader';

export const VIEW_TYPE = 'card-library-view';

const isFileValid = (file, extension = 'canvas') => {
  return file instanceof TFile && file.extension === extension;
};

const updateQueryPath = (file: TFile, oldPath?: string) => {
  const currentPathQuery = locationService.getState().query.path;
  if (currentPathQuery && currentPathQuery.length === 1 && currentPathQuery[0] === oldPath) {
    locationService.setQueryWithType('path', file.path === oldPath ? [] : [file.path]);
  }
};

class UpdateService {
  constructor() {
    this.handleFileCreate = this.handleFileCreate.bind(this);
    this.handleFileDelete = this.handleFileDelete.bind(this);
    this.handleFileRename = this.handleFileRename.bind(this);
    this.handleFileModify = debounce(this.handleFileModify.bind(this), 300, true);
  }
  handleFileCreate(file) {
    if (!isFileValid(file)) return;
    this.processFileCreation(file);
  }

  handleFileDelete(file) {
    if (!isFileValid(file)) return;
    this.processFileDeletion(file);
  }

  handleFileRename(file, oldPath) {
    if (file instanceof TFolder) {
      file.children.forEach((child: TFile) => {
        if (isFileValid(child, 'canvas')) {
          this.processFileRename(child, oldPath + '/' + child.basename + '.canvas');
        }
      });
    } else if (isFileValid(file)) {
      this.processFileRename(file, oldPath);
    }
  }

  handleFileModify(file) {
    if (!isFileValid(file)) return;
    if (globalService.getState().changedBySelf) {
      globalService.setChangedByCardLibrary(false);
      return;
    }
    cardService.updateCardsBatch(file);
  }

  processFileCreation(file) {
    cardService.updateCardsBatch(file);
    cardService.updateTagsState();
    fileService.addFile(file);
  }

  processFileDeletion(file) {
    cardService.deleteCardsBatch(file);
    cardService.updateTagsState();
    fileService.updateFiles(file, true);
    updateQueryPath(file, file.path);
  }

  processFileRename(file, oldPath) {
    cardService.updateCardsBatch(file);
    fileService.updateFilesBasedOnOldPath(oldPath);
    updateQueryPath(file, oldPath);
  }
}

export class CardLibraryView extends ItemView {
  protected readonly scope = new Scope(this.app.scope);
  root: ReactDOM.Root;
  searchBarRoot: ReactDOM.Root;
  updateService: UpdateService;

  getViewType(): string {
    return VIEW_TYPE;
  }

  getDisplayText(): string {
    return 'Card Library';
  }

  getIcon(): string {
    return 'library';
  }

  handleCopy = (e: ClipboardEvent) => {
    e.clipboardData.clearData();
    const copyCardId = globalService.getState().copyCardIds;
    const query = locationService.getState().query;
    const cardList = copyCardId.map((id) => cardService.getCardById(id));
    const cardData: CanvasNodeData[] = [];
    for (const card of cardList) {
      const tempcard = { ...card, id: randomId(16), originId: card.id };

      tempcard[TYPE_TO_ORIGIN[tempcard.type]] = tempcard.content;
      tempcard.color = tempcard?.color?.split('-')[1];

      delete tempcard.content;
      cardData.push(tempcard as unknown as CanvasNodeData);
    }

    if (!cardList && cardList.length === 0) return;

    const data = {
      nodes: [...cardData],
      edges: [],
      center: true,
    };

    e.clipboardData.setData('obsidian/canvas', JSON.stringify(data));
    if (queryIsEmptyOrBlank(query)) globalService.setCopyCardId([]);
    e.preventDefault();
  };

  async handleResize() {
    const leaf = this.leaf;
    if (leaf && leaf.height !== 0) {
      globalService.setViewStatus(leaf.width < 400 ? 'sm' : leaf.width < 600 ? 'md' : leaf.width < 900 ? 'lg' : 'xl');

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

  checkCurrentViewHeaderVisibility = () => {
    return this.contentEl.closest('.mod-root') && this.app.vault.getConfig('showViewHeader');
  };

  checkCanvasViewOpened = () => {
    return this.app.workspace.getLeavesOfType('canvas').length > 0;
  };

  registerFileEvent(
    eventType: 'create' | 'delete' | 'modify' | 'rename',
    handler: (file: TFile | TFolder, oldPath?: string) => void,
  ) {
    this.registerEvent(this.app.vault.on(eventType, handler));
  }

  initializeFileEventListeners() {
    this.registerFileEvent('create', this.updateService.handleFileCreate);
    this.registerFileEvent('delete', this.updateService.handleFileDelete);
    this.registerFileEvent('rename', this.updateService.handleFileRename);
    this.registerFileEvent('modify', this.updateService.handleFileModify);
  }

  initializeLayoutEventListeners() {
    const debouncedHandleResize = debounce(this.handleResize.bind(this), 50, true);

    this.registerEvent(
      this.app.workspace.on('layout-change', async () => {
        console.log(this);

        globalService.setViewHeaderVisibility(this.checkCurrentViewHeaderVisibility());
        globalService.setHasCanvasViewOpened(this.checkCanvasViewOpened());

        debouncedHandleResize();
      }),
    );
    this.registerEvent(
      this.app.workspace.on('resize', () => {
        debouncedHandleResize();
      }),
    );
    this.registerEvent(
      this.app.workspace.on('show-view-header', (toggle: boolean) => {
        globalService.setViewHeaderVisibility(toggle);
      }),
    );
  }

  initializeScopeEvent() {
    const { scope } = this;
    (scope as Scope).register(['Mod'], 'f', () => {
      this.app.workspace.trigger(
        'focus-on-search-bar',
        globalService.getState().viewHeaderVisibility ? 'header' : 'inline',
      );
    });
    (scope as Scope).register(['Mod'], 'n', () => {
      this.app.workspace.trigger('create-card-dialog');
    });
    (scope as Scope).register(['Mod', 'Shift'], 'n', () => {
      this.app.workspace.trigger('create-card-dialog-from-clipboard', true);
    });
  }

  async renderApp() {
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

  renderSearchBar() {
    try {
      this.searchBarRoot = ReactDOM.createRoot(this.titleContainerEl);
      this.searchBarRoot.render(
        <React.StrictMode>
          <Provider store={appStore} context={appContext}>
            <>
              <ViewHeader />
            </>
          </Provider>
        </React.StrictMode>,
      );
    } catch (e) {
      console.log(e);
    }
  }

  async onOpen(): Promise<void> {
    this.updateService = new UpdateService();
    this.initializeScopeEvent();
    this.initializeFileEventListeners();
    this.initializeLayoutEventListeners();

    this.contentEl.toggleClass('card-library', true);
    this.renderSearchBar();
    globalService.setViewHeaderVisibility(this.checkCurrentViewHeaderVisibility());
    console.log('check', this.checkCurrentViewHeaderVisibility());

    await this.renderApp();
  }

  onunload(): void {
    super.onunload();
    this.root.unmount();
    if (this.searchBarRoot) this.searchBarRoot.unmount();

    if (this.app.workspace.getLeavesOfType(VIEW_TYPE).length === 1) globalService.setView(null);
    globalService.setSidebarEditCardId('');
    locationService.setPathname('/');
  }
}
