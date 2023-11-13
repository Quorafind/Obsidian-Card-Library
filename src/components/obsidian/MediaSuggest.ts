import { App, FuzzyMatch, FuzzySuggestModal, SuggestModal, TFile } from 'obsidian';

export const MIME_TYPES: Record<string, string[]> = {
  'image/apng': ['apng'],
  'image/avif': ['avif'],
  'image/gif': ['gif'],
  'image/jpeg': ['jpg', 'jpeg', 'jpe'],
  'image/png': ['png'],
  'image/webp': ['webp'],
};
export const IMAGE_EXTENSIONS = Object.values(MIME_TYPES).flat();

export default class MediaSuggestModal extends FuzzySuggestModal<TFile> {
  path: string;
  cb: (file: TFile) => void;

  constructor(app: App, cb: (file: TFile) => void) {
    super(app);

    this.cb = cb;

    this.containerEl.addClass('card-library-local-image-modal');
    this.setPlaceholder('Pick an image to replace current image');
  }

  getItems(): TFile[] {
    return this.app.vault.getFiles().filter((file) => IMAGE_EXTENSIONS.includes(file.extension));
  }

  getItemText(item: TFile): string {
    return item.path;
  }

  renderSuggestion({ item, match }: FuzzyMatch<TFile>, el: HTMLElement): void {
    el.setText(item.path);
    console.log(match);
  }

  onChooseItem(item: TFile): void {
    this.cb(item);
    this.close();
  }
}
