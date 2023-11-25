import appStore from '@/stores/appStore';
import { createQuery, deleteQuery, getQuery, updateQuery } from '@/lib/queryUtils';
import { NOP_FIRST_TAG_REG, TAG_REG } from '@/lib/consts';
import { Model } from '@/types/models';

class QueryService {
  public getState() {
    return appStore.getState().queryState;
  }

  public async getQueries() {
    const data = await getQuery();
    appStore.dispatch({
      type: 'SET_QUERIES',
      payload: {
        queries: data,
      },
    });
    return data;
  }

  public getQueryById(id: string) {
    for (const q of this.getState().queries) {
      if (q.id === id) {
        return q;
      }
    }
  }

  public pushQuery(query: Model.Query) {
    const queries = this.getState().queries;
    appStore.dispatch({
      type: 'INSERT_QUERY',
      payload: {
        query: {
          ...queries,
          ...query,
        },
      },
    });
  }

  public requestQueryUpdate(query: Model.Query) {
    appStore.dispatch({
      type: 'UPDATE_QUERY',
      payload: query,
    });
  }

  public async deleteQuery(queryId: string) {
    await deleteQuery(queryId);
    appStore.dispatch({
      type: 'DELETE_QUERY_BY_ID',
      payload: {
        id: queryId,
      },
    });
  }

  public async createQuery(title: string, querystring: string) {
    return await createQuery(title, querystring);
  }

  public async updateQuery(id: string, patch: Partial<Model.Query>) {
    const query = await updateQuery(id, patch);
    this.requestQueryUpdate(query);
    return;
  }

  public checkInFilters(card: Model.Card, filters: Filter[]) {
    let shouldShow = true;

    for (const f of filters) {
      const { relation } = f;
      const r = this.checkShouldShowCard(card, f);
      if (relation === 'OR') {
        shouldShow = shouldShow || r;
      } else {
        shouldShow = shouldShow && r;
      }
    }

    return shouldShow;
  }

  public checkShouldShowCard(memo: Model.Card, filter: Filter) {
    const {
      type,
      value: { operator, value },
    } = filter;

    if (value === '') {
      return true;
    }

    let shouldShow = true;

    if (type === 'TAG') {
      let contained = true;
      const tagsSet = new Set<string>();
      for (const t of Array.from(memo.content.match(TAG_REG) ?? [])) {
        const tag = t.replace(TAG_REG, '$1').trim();
        const items = tag.split('/');
        let temp = '';
        for (const i of items) {
          temp += i;
          tagsSet.add(temp);
          temp += '/';
        }
      }
      for (const t of Array.from(memo.content.match(NOP_FIRST_TAG_REG) ?? [])) {
        const tag = t.replace(NOP_FIRST_TAG_REG, '$1').trim();
        const items = tag.split('/');
        let temp = '';
        for (const i of items) {
          temp += i;
          tagsSet.add(temp);
          temp += '/';
        }
      }
      if (!tagsSet.has(value)) {
        contained = false;
      }
      if (operator === 'NOT_CONTAIN') {
        contained = !contained;
      }
      shouldShow = contained;
    } else if (type === 'TYPE') {
      let matched = false;
      if (memo.type === value) {
        matched = true;
      }
      if (operator === 'IS_NOT') {
        matched = !matched;
      }
      shouldShow = matched;
    } else if (type === 'TEXT') {
      let contained = memo.content.includes(value);
      if (operator === 'NOT_CONTAIN') {
        contained = !contained;
      }
      shouldShow = contained;
    }

    return shouldShow;
  }
}

const queryService = new QueryService();

export default queryService;
