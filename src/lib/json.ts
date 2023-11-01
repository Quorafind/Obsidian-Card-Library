import { App } from "obsidian";

export const querySavePath = (app: App) => {
    return `${app.vault.configDir}/cardQuery.json`;
};

export const checkJsonFileExists = async (app: App, path: string) => {
    try {
        await app.vault.adapter.read(path);
        return true;
    } catch (error) {
        return false;
    }
};

export const loadQueryJson = async (app: App): Promise<any[]> => {
    const exists = await checkJsonFileExists(app, querySavePath(app));
    if (!exists) {
        await initQueryJson(app);
    }

    const result = JSON.parse(await app.vault.adapter.read(querySavePath(app)));

    return result.queries || [];
};

export const saveQueryJson = async (app: App, data: Query[]) => {
    await app.vault.adapter.write(querySavePath(app), JSON.stringify({queries: data}, null, 2));
};

export const initQueryJson = async (app: App) => {
    await app.vault.adapter.write(
        querySavePath(app),
        JSON.stringify(
            {
                queries: [],
            },
            null,
            2,
        ),
    );
};
