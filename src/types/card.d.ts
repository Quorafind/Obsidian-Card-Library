type CardId = string;
type CardSpecType = 'media' | 'image' | 'pdf' | 'text' | 'file' | 'link';
type CardRowStatus = 'NORMAL' | 'ARCHIVED';

interface CardPatch {
  id?: CardId;
  content?: string;
  pinned?: boolean;
  deleted?: boolean;
  rowStatus?: CardRowStatus;
  color?: string;
}
