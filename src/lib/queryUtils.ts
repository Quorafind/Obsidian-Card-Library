import { checkJsonFileExists, initQueryJson, loadQueryJson, querySavePath, saveQueryJson } from "@/lib/json";
import { globalService } from "@/services";
import { moment, Notice } from "obsidian";
import { randomId } from "@/lib/obsidianUtils";

export const getQuery = async (): Promise<Model.Query[]> => {
    const app = globalService.getState().app;
    const existQueryFile = await checkJsonFileExists(app, querySavePath(app));
    if (!existQueryFile) await initQueryJson(app);
    return (await loadQueryJson(app)) || [];
};

export const pinQueryInFile = async (id: string): Promise<string | void> => {
    const app = globalService.getState().app;
    const queryList = (await loadQueryJson(app)) || [];
    const query = queryList.find((query) => query.id === id);
    if (query) {
        const pinnedAtDate = moment().format('x');
        query.pinnedAt = pinnedAtDate;
        await saveQueryJson(app, queryList);
        return pinnedAtDate;
    } else {
        new Notice('Query not found');
        return;
    }
};

export const unpinQueryInFile = async (id: string): Promise<void> => {
    const app = globalService.getState().app;
    const queryList = (await loadQueryJson(app)) || [];
    const query = queryList.find((query) => query.id === id);
    if (query) {
        query.pinnedAt = '';
        await saveQueryJson(app, queryList);
        return;
    } else {
        new Notice('Query not found');
        return;
    }
};

export const createQuery = async (title: string, querystring: string): Promise<Model.Query> => {
    const app = globalService.getState().app;
    const queryList = (await loadQueryJson(app)) || [];
    const query = {
        createdAt: moment().format('x'),
        id: randomId(16),
        pinnedAt: '',
        querystring,
        title,
        updatedAt: moment().format('x'),
        userId: 'card',
    };
    queryList.push(query);
    await saveQueryJson(app, queryList);
    return query;
};

export async function deleteQuery(id: string): Promise<void> {
    const app = globalService.getState().app;
    const queryList = (await loadQueryJson(app)) || [];
    const index = queryList.findIndex((q) => q.id === id);
    queryList.splice(index, 1);

    await saveQueryJson(app, queryList);
    return;
}

export const updateQuery = async (id: string, patch: Partial<Model.Query>): Promise<Model.Query> => {
    const app = globalService.getState().app;
    const queryList = (await loadQueryJson(app)) || [];
    const oldQuery = queryList.find((q) => q.id === id);
    const newQuery = {
        ...oldQuery,
        ...patch,
    };
    const index = queryList.findIndex((q) => q.id === id);
    queryList.splice(index, 1, newQuery);
    await saveQueryJson(app, queryList);
    return newQuery;
};
