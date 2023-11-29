interface TDuration {
  from: number;
  to: number;
}

interface Query {
  tags: string[];
  type: CardSpecType[];
  color: string[];
  linked: string[];
  text: string;
  filter: string;
  path: string[];
  specPath: '' | 'archive' | 'starred' | 'trash';
}

type AppRouter = '/' | '/editor';

interface AppLocation {
  pathname: AppRouter;
  hash: string;
  query: Query;
}
