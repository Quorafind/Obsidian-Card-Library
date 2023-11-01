type CardLibraryType = 'list' | 'waterfall' | 'calendar' | 'minimal';
type QueryType = 'tags' | 'type' | 'color' | 'linked' | 'path';

interface Action<T extends string, P> {
  type: T;
  payload: P;
}
