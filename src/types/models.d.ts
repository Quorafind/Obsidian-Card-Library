declare namespace Model {
  interface BaseModel {
    id: string;
    createdAt?: string;
    updatedAt?: string;
  }

  interface Card extends BaseModel {
    content: string;
    type: CardSpecType;
    path: string;
    pinned?: boolean;
    deletedAt?: string;
    rowStatus?: CardRowStatus;
    color?: string;
    linked?: string;
  }

  interface Query extends BaseModel {
    title: string;
    querystring: string;
    pinnedAt: string;
  }
}
