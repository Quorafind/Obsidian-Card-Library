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
}

type AppRouter = '/' | '/single';

interface AppLocation {
  pathname: AppRouter;
  hash: string;
  query: Query;
}
