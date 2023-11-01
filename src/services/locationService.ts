import appStore from '../stores/appStore';

class LocationService {
  constructor() {
    this.updateStateWithLocation();
    window.onpopstate = () => {
      this.updateStateWithLocation();
    };
  }

  public updateStateWithLocation = () => {
    const { pathname, search, hash } = window.location;
    const urlParams = new URLSearchParams(search);
    const state: AppLocation = {
      pathname: '/',
      hash: '',
      query: {
        tags: [],
        color: [],
        linked: [],
        text: '',
        type: [],
        filter: '',
        path: [],
      },
    };
    state.query.tags = (urlParams.get('tags') ?? []) as string[];
    state.query.type = (urlParams.get('type') ?? []) as CardSpecType[];
    state.query.text = urlParams.get('text') ?? '';
    state.query.filter = urlParams.get('filter') ?? '';
    state.hash = hash;
    state.pathname = this.getValidPathname(pathname);
    appStore.dispatch({
      type: 'SET_LOCATION',
      payload: state,
    });
  };

  public getState = () => {
    return appStore.getState().locationState;
  };

  public clearQuery = () => {
    appStore.dispatch({
      type: 'SET_QUERY',
      payload: {
        tags: [],
        color: [],
        linked: [],
        text: '',
        type: [],
        filter: '',
        path: [],
      },
    });
  };

  public setQuery = (query: Query) => {
    appStore.dispatch({
      type: 'SET_QUERY',
      payload: query,
    });
  };

  public setHash = (hash: string) => {
    appStore.dispatch({
      type: 'SET_HASH',
      payload: {
        hash,
      },
    });
  };

  public setPathname = (pathname: string) => {
    appStore.dispatch({
      type: 'SET_PATHNAME',
      payload: {
        pathname,
      },
    });
  };

  public pushHistory = (pathname: string) => {
    appStore.dispatch({
      type: 'SET_PATHNAME',
      payload: {
        pathname,
      },
    });
  };

  public replaceHistory = (pathname: string) => {
    appStore.dispatch({
      type: 'SET_PATHNAME',
      payload: {
        pathname,
      },
    });
  };

  public setMemoFilter = (filterId: string) => {
    appStore.dispatch({
      type: 'SET_QUERY_FILTER',
      payload: filterId,
    });
  };

  public setTextQuery = (text: string) => {
    appStore.dispatch({
      type: 'SET_TEXT',
      payload: {
        text,
      },
    });
  };

  public setQueryWithType = (target: QueryType, value: CardSpecType[] | string[]) => {
    appStore.dispatch({
      type: 'SET_QUERY_WITH_TYPE',
      payload: {
        target,
        value,
      },
    });
  };

  public setTypeQuery = (type: CardSpecType[] | [] = []) => {
    appStore.dispatch({
      type: 'SET_TYPE',
      payload: {
        type,
      },
    });
  };
  public setTagQuery = (tags: string[]) => {
    appStore.dispatch({
      type: 'SET_TAG_QUERY',
      payload: {
        tags,
      },
    });
  };

  public getValidPathname = (pathname: string): AppRouter => {
    if (['/', '/canvas', '/recycle'].includes(pathname)) {
      return pathname as AppRouter;
    } else {
      return '/';
    }
  };
}

const locationService = new LocationService();

export default locationService;
