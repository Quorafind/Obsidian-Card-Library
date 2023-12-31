export type settingSearchInfo = {
  containerEl: HTMLElement;
  name: string;
  description: string;
  options: SearchOptionInfo[];
  alias?: string;
};
export type TabContentInfo = {
  content: HTMLElement;
  heading: HTMLElement;
  navButton: HTMLElement;
};
export type SearchOptionInfo = {
  name: string;
  description: string;
  options?: DropdownRecord[];
};
export type TabName = 'General' | 'Cards' | 'Theme' | 'Output';

export class DropdownRecord {
  public value: string;
  public description: string;

  constructor(value: string, description: string) {
    this.value = value;
    this.description = description;
  }
}

export interface CardLibrarySettings {
  general: {
    global: boolean;
    defaultFileName: string;
  };
  cards: {
    useTemplate: boolean;
    templatePath: string;
  };
  theme: {
    listStyle: 'grid' | 'masonry';
    actionHeaderInGrid: boolean;
  };
  output: {
    exportType: 'image' | 'markdown' | 'pdf' | 'canvas';
    exportPath: string;
    exportFileName: string;
    exportTemplate: string;
  };
}
