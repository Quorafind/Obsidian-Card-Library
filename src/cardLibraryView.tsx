import { debounce, ItemView, TFile, TFolder } from 'obsidian';
import ReactDOM from 'react-dom/client';
import { cardService, fileService, globalService, locationService } from '@/services';
import React from 'react';
import App from '@/App';
import { TYPE_TO_ORIGIN } from '@/lib/obsidianUtils';
import { CanvasNodeData } from 'obsidian/canvas';
import { queryIsEmptyOrBlank } from '@/lib/utils';

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

  handleCopy = (e: ClipboardEvent) => {
    console.log('handleCopy', e);
    e.clipboardData.clearData();
    const copyCardId = globalService.getState().copyCardIds;
    const query = locationService.getState().query;
    const cardList = copyCardId.map((id) => cardService.getCardById(id));
    const cardData: CanvasNodeData[] = [];
    for (const card of cardList) {
      const tempcard = { ...card };

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

    console.log(cardData, data);

    e.clipboardData.setData('obsidian/canvas', JSON.stringify(data));
    console.log(e.clipboardData.getData('obsidian/canvas'));
    if (queryIsEmptyOrBlank(query)) globalService.setCopyCardId([]);
    e.preventDefault();
  };

  async handleResize() {
    console.log('handleResize');
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

  async onOpen(): Promise<void> {
    this.registerEvent(
      this.app.workspace.on('layout-change', () => {
        console.log('layout-change');
        this.handleResize();
      }),
    );
    const debouncedHandleResize = debounce(this.handleResize.bind(this), 50, true);

    this.registerEvent(
      this.app.workspace.on('resize', () => {
        debouncedHandleResize();
      }),
    );
    this.registerEvent(
      this.app.vault.on('create', (file) => {
        if (!(file instanceof TFile)) return;
        if (file.extension !== 'canvas') return;
        cardService.updateCardsBatch(file);
        cardService.updateTagsState();
        fileService.addFile(file);
      }),
    );
    this.registerEvent(
      this.app.vault.on('delete', (file) => {
        if (!(file instanceof TFile)) return;
        if (file.extension !== 'canvas') return;
        cardService.deleteCardsBatch(file);
        cardService.updateTagsState();
        fileService.updateFiles(file, true);
      }),
    );
    this.registerEvent(
      this.app.vault.on('rename', (file, oldPath) => {
        if (file instanceof TFolder) {
          for (const child of file.children) {
            if (child instanceof TFile && child.extension === 'canvas') {
              cardService.updateCardsBatch(child);
              fileService.updateFilesBasedOnOldPath(oldPath + '/' + child.basename + '.canvas');
            }
          }
        } else if (file instanceof TFile) {
          if (file.extension === 'canvas') {
            cardService.updateCardsBatch(file);
            fileService.updateFilesBasedOnOldPath(oldPath);
          }
        }
      }),
    );
    this.registerEvent(
      this.app.vault.on('modify', (file) => {
        if (!(file instanceof TFile)) return;
        if (file.extension !== 'canvas') return;
        cardService.updateCardsBatch(file);
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

    globalService.setView(null);
    globalService.setSidebarEditCardId('');
    locationService.setPathname('/');
  }
}
