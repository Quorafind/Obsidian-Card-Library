import 'obsidian';
import { EventRef, MarkdownView, TFile } from 'obsidian';
import { CanvasData } from 'obsidian/canvas';
import { CardLibrarySettings } from '@/types/settings';

export interface CanvasNodeUnknownData {
  id: string;
  type: CardSpecType;
  collapsed: boolean;

  [key: string]: any;
}

type TargetLocation = 'left' | 'right' | 'center' | 'float';
type modKeys = 'ctrl' | 'meta' | 'shift' | 'alt';

export interface commandsList {
  id: string;
  shortName: string;
  name: string;
  icon: string;
  location: TargetLocation;
  cb: () => void;
}

type KeyEvent = {
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  [key: string]: any; // 允许其它属性
};

type Prettify<T> = {
  [K in keyof T]: T[K];
} & unknown;

export type ribbonCommandsList = Prettify<
  commandsList & {
    modKeys?: modKeys | modKeys[] | undefined;
  }
>;

declare module 'obsidian' {
  type CanvasNodeID = string;
  type CanvasEdgeID = string;

  interface WorkspaceLeaf {
    width: number;
    height: number;
  }

  interface Editor {
    containerEl: HTMLElement;
  }

  interface MarkdownEditor {
    constructor: any;
    set: (value: string) => void;
    get: () => string;
    onUpdate: (e: any, update: boolean) => void;
    destroy: () => void;
    clear: () => void;
    editor: any;
    toggleSource: () => void;
  }

  interface Menu {
    dom: HTMLElement;

    addSections(sections: string[]): Menu;

    setParentElement(evt: EventTarget | null): Menu;
  }

  interface App {
    appId: string;
    plugins: {
      getPlugin(name: string): any;
    };
    embedRegistry: {
      embedByExtension: {
        md: (...args: any[]) => MarkdownInfo;
      };
    };
    commands: any;
  }

  interface View {
    contentEl: HTMLElement;
  }

  interface MarkdownFileInfo {
    view?: any;
  }

  interface MarkdownInfo {
    set: (value: string) => void;
    showEditor: () => void;
    editMode: any;
    editable: boolean;
  }

  interface MarkdownEditor {
    constructor: any;
    set: (value: string) => void;
    get: () => string;
    onUpdate: (e: any, update: boolean) => void;
    destroy: () => void;
    clear: () => void;
    editor: any;
    toggleSource: () => void;
  }

  interface Workspace {
    on(name: 'card-library-settings-updated', callback: (settings: CardLibrarySettings) => any, ctx?: any): EventRef;

    on(name: 'fetch-memos', callback: () => any, ctx?: any): EventRef;
  }

  interface CanvasView extends View {
    canvas: Canvas;
    file: TFile;
  }

  interface Canvas {
    readonly: boolean;
    view: MarkdownView;
    x: number;
    y: number;
    nodes: Map<CanvasNodeID, CanvasNode>;
    edges: Map<string, CanvasEdge>;
    nodeInteractionLayer: CanvasInteractionLayer;
    selection: Set<CanvasNode>;

    menu: CanvasMenu;

    wrapperEl: HTMLElement;

    history: any;
    requestPushHistory: any;
    nodeIndex: any;

    requestSave(save?: boolean, triggerBySelf?: boolean): void;

    getData(): CanvasData;

    setData(data: CanvasData): void;

    getEdgesForNode(node: CanvasNode): CanvasEdge[];

    getContainingNodes(coords: CanvasCoords): CanvasNode[];

    deselectAll(): void;

    select(nodes: CanvasNode): void;

    requestFrame(): void;
  }

  interface ICanvasData {
    nodes: CanvasNode[];
    edges: CanvasEdge[];
  }

  interface CanvasMenu {
    containerEl: HTMLElement;
    menuEl: HTMLElement;
    canvas: Canvas;
    selection: CanvasSelection;

    render(): void;

    updateZIndex(): void;
  }

  interface CanvasSelection {
    selectionEl: HTMLElement;
    resizerEls: HTMLElement;
    canvas: Canvas;
    bbox: CanvasCoords | undefined;

    render(): void;

    hide(): void;

    onResizePointerDown(e: PointerEvent, direction: CanvasDirection): void;

    update(bbox: CanvasCoords): void;
  }

  interface CanvasInteractionLayer {
    interactionEl: HTMLElement;
    canvas: Canvas;
    target: CanvasNode | null;

    render(): void;

    setTarget(target: CanvasNode | null): void;
  }

  interface CanvasNode {
    id: CanvasNodeID;

    x: number;
    y: number;
    width: number;
    height: number;
    zIndex: number;
    bbox: CanvasCoords;
    unknownData: CanvasNodeUnknownData;
    renderedZIndex: number;

    headerComponent: Component;

    nodeEl: HTMLElement;
    labelEl: HTMLElement;
    contentEl: HTMLElement;
    containerEl: HTMLElement;

    canvas: Canvas;
    app: App;

    getBBox(containing?: boolean): CanvasCoords;

    render(): void;
  }

  interface CanvasTextNode extends CanvasNode {
    text: string;
    child: any;
  }

  interface CanvasFileNode extends CanvasNode {
    file: TFile;
  }

  interface CanvasLinkNode extends CanvasNode {
    url: string;
  }

  interface CanvasGroupNode extends CanvasNode {
    label: string;
  }

  interface CanvasEdge {
    id: CanvasEdgeID;

    label: string | undefined;
    lineStartGroupEl: SVGGElement;
    lineEndGroupEl: SVGGElement;
    lineGroupEl: SVGGElement;

    path: {
      display: SVGPathElement;
      interaction: SVGPathElement;
    };

    canvas: Canvas;
    bbox: CanvasCoords;

    unknownData: CanvasNodeUnknownData;
  }

  interface CanvasCoords {
    maxX: number;
    maxY: number;
    minX: number;
    minY: number;
  }
}
