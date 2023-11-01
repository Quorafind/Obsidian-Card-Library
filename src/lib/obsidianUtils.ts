import { fileService, globalService } from '@/services';
import { TFile, moment, App, Notice } from 'obsidian';
import {
  CanvasData,
  CanvasEdgeData,
  CanvasFileData,
  CanvasLinkData,
  CanvasNodeData,
  CanvasTextData,
} from 'obsidian/canvas';

type NodeTypeSpecificProps = CanvasTextData | CanvasLinkData | CanvasFileData;

export function randomId(e: number): string {
  const t = [];
  let n = 0;
  for (; n < e; n++) t.push(((16 * Math.random()) | 0).toString(16));
  return t.join('');
}

export function getExtension(path: string): string {
  const parts = path.split('.');
  if (parts.length === 1 || (parts[0] === '' && parts.length === 2)) return '';
  return parts.pop();
}

export function checkImageExtension(path: string): boolean {
  const ext = getExtension(path);
  return ['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(ext);
}

export function checkMediaExtension(path: string): boolean {
  const ext = getExtension(path);
  return ['mp4', 'mov', 'avi', 'mkv', 'mp3', 'wav', 'ogg', 'flac'].includes(ext);
}

export function checkIfLinked(id: string, edges: CanvasEdgeData[]) {
  return edges.some((edge) => edge.fromNode === id || edge.toNode === id);
}

export function getCanvasFile(path: string, app: App): TFile | undefined {
  const canvasFile = app.vault.getAbstractFileByPath(path) as TFile;
  if (!canvasFile) return undefined;
  return canvasFile;
}

export async function getAllCards(): Promise<Model.Card[]> {
  const app = globalService.getState().app;
  const cards: Model.Card[] = [];
  const files = app.vault.getAllLoadedFiles().filter((file) => file instanceof TFile && file.extension === 'canvas');
  await fileService.setFiles(files as TFile[]);

  for (const file of files) {
    await getCardFromCanvas(file as TFile, cards);
  }

  console.log(cards);

  return cards;
}

export async function getDeletedCardsInCards(cards: Model.Card[]): Promise<Model.Card[]> {
  return cards.filter((c) => c.deletedAt && c.deletedAt !== '');
}

export async function getCardFromCanvas(file: TFile, cards: Model.Card[]): Promise<void> {
  const app = globalService.getState().app;
  if (!(file instanceof TFile)) return;
  let content = '';
  try {
    content = await app.vault.read(file);
  } catch (e) {
    content = await app.vault.cachedRead(file);
  }
  if (!content) return;
  const canvasData = JSON.parse(content);
  const nodes = canvasData?.nodes as CanvasNodeData[];
  const edges = canvasData?.edges as CanvasEdgeData[];
  if (!nodes) return;

  for (const node of nodes) {
    if (node.type === 'group') continue;
    const id = node?.id ? node?.id : '';
    let content = '';
    let type: CardSpecType = 'text';
    switch (node.type as CardSpecType) {
      case 'text': {
        content = node?.text ? node?.text : '';
        break;
      }
      case 'link': {
        content = node?.url ? node?.url : '';
        type = 'link';
        break;
      }
      case 'file': {
        content = node?.file ? node?.file : '';
        type =
          getExtension(content) === 'pdf'
            ? 'pdf'
            : checkImageExtension(content)
            ? 'image'
            : checkMediaExtension(content)
            ? 'media'
            : 'file';
        break;
      }
    }
    if (!content) continue;
    cards.push({
      id,
      pinned: !!node?.pinned,
      rowStatus: node?.archived ? 'ARCHIVED' : 'NORMAL',
      color: node?.color ? (node?.color.startsWith('#') ? 'color-custom' : `color-${node?.color}`) : 'color-blank',
      content,
      deletedAt: node?.deletedAt ? moment(node?.deletedAt).format('YYYY/MM/DD HH:mm:SS') : '',
      path: file.path,
      linked: checkIfLinked(id, edges) ? 'linked' : 'single',
      type,
    });
  }
}

export async function createCardInCanvas({
  content,
  type,
  path = 'basic.canvas',
}: {
  content: string;
  type: CardSpecType;
  path?: string;
}): Promise<Model.Card> {
  const app = globalService.getState().app;
  const date = moment();
  const id = randomId(16);

  const commonProperties = {
    id,
    deletedAt: '',
    createdAt: date.format('x'),
    updatedAt: date.format('x'),
    pinned: false,
    rowStatus: 'NORMAL' as CardRowStatus,
  };

  const card: Model.Card = {
    ...commonProperties,
    content,
    path,
    type,
  };

  const canvasFile = getCanvasFile(path, app);
  if (!canvasFile || !(canvasFile instanceof TFile)) {
    new Notice('File not found for the given memoPath, is creating a new file');
    return;
  }

  const canvasContent: string = await app.vault.read(canvasFile);
  const json: CanvasData = JSON.parse(canvasContent);

  if (json.nodes.find((node) => node.id === card.id)) {
    return;
  }

  const latestNode = json.nodes[json.nodes.length - 1];
  const posFromNewestNode = latestNode
    ? {
        x: latestNode.x,
        y: latestNode.y + 100,
        width: latestNode.width,
        height: latestNode.height,
      }
    : { x: 0, y: 0, width: 200, height: 100 };

  let nodeTypeSpecificProps: NodeTypeSpecificProps;
  switch (type as CardSpecType) {
    case 'text':
      nodeTypeSpecificProps = { type: 'text', text: content } as CanvasTextData;
      break;
    case 'link':
      nodeTypeSpecificProps = { type: 'link', url: content } as CanvasLinkData;
      break;
    case 'pdf':
    case 'image':
    case 'media':
    case 'file':
      nodeTypeSpecificProps = { type: 'file', file: content } as CanvasFileData;
      break;
  }

  json.nodes.push({
    ...posFromNewestNode,
    ...commonProperties,
    ...nodeTypeSpecificProps,
  });

  globalService.setChangedByMemos(true);
  const newContent = JSON.stringify(json, null, 2);
  await app.vault.modify(canvasFile, newContent);

  return card;
}

export async function deleteCardInCanvas(card: Model.Card): Promise<Model.Card> {
  const app = globalService.getState().app;
  const canvasFile = app.vault.getAbstractFileByPath(card.path) as TFile;
  if (!canvasFile) return card;

  const content: string = await app.vault.read(canvasFile);
  const json: CanvasData = JSON.parse(content);
  json.nodes = json.nodes.filter((node) => node.id !== card.id);

  const newContent = JSON.stringify(json, null, 2);
  await app.vault.modify(canvasFile, newContent);
  return card;
}

export async function updateCardInFile(oldCard: Model.Card, patch: CardPatch): Promise<Model.Card> {
  const app = globalService.getState().app;
  const canvasFile = app.vault.getAbstractFileByPath(oldCard.path) as TFile;
  if (!canvasFile) return oldCard;

  const content: string = await app.vault.read(canvasFile);
  const json: CanvasData = JSON.parse(content);
  const node = json.nodes.find((node) => node.id === oldCard.id);

  if (!node) return oldCard;
  switch (oldCard.type as CardSpecType) {
    case 'text': {
      if (patch.content) node.text = patch.content;
      break;
    }
    case 'link': {
      if (patch.content) node.url = patch.content;
      break;
    }
    case 'file': {
      if (patch.content) node.file = patch.content;
      break;
    }
  }

  if (patch.rowStatus) node.rowStatus = patch.rowStatus;
  if (patch.pinned !== undefined) node.pinned = patch.pinned;
  const deletedTime = moment();
  if (patch.deleted !== undefined) node.deletedAt = patch.deleted ? deletedTime.format('YYYY/MM/DD HH:mm:ss') : '';
  node.updatedAt = deletedTime.format('YYYY/MM/DD HH:mm:ss');

  const newContent = JSON.stringify(json, null, 2);
  await app.vault.modify(canvasFile, newContent);

  globalService.setChangedByMemos(true);
  return {
    ...oldCard,
    content: patch.content ?? oldCard.content,
    rowStatus: patch.rowStatus ?? oldCard.rowStatus,
    pinned: patch.pinned ?? oldCard.pinned,
    deletedAt: patch.deleted
      ? deletedTime.format('YYYY/MM/DD HH:mm:ss')
      : patch.deleted === false
      ? ''
      : oldCard.deletedAt
      ? oldCard.deletedAt
      : '',
  };
}

export const showMemoInCanvas = async (memoId: string, memoPath: string): Promise<void> => {
  const app = globalService.getState().app;

  const selectAndZoom = (canvas: any, nodeId: string) => {
    const node = Array.from(canvas.nodes.values())?.find((node: any) => node.id === nodeId);
    if (node) {
      console.log('Found node', node);
      canvas.selectOnly(node);
      canvas.zoomToSelection();
      return true;
    }
    return false;
  };

  const leaves = app.workspace.getLeavesOfType('canvas');
  for (const leaf of leaves) {
    const canvasView = leaf.view as any;
    if (canvasView?.file?.path === memoPath) {
      if (selectAndZoom(canvasView.canvas, memoId)) return;
    }
  }

  const file = app.metadataCache.getFirstLinkpathDest('', memoPath);
  if (!file) {
    new Notice('File not found for the given memoPath');
    return;
  }

  const leaf = app.workspace.getLeaf('split');
  await leaf.openFile(file);
  setTimeout(() => {
    selectAndZoom((leaf.view as any)?.canvas, memoId);
  }, 10);
};
