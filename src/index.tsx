import { ItemView, Plugin, WorkspaceLeaf } from "obsidian";
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from "./App";
import "@/less/globals.less";

const VIEW_TYPE = "card-library-view";

class CardLibraryView extends ItemView {
    root: ReactDOM.Root;

    getViewType(): string {
        return VIEW_TYPE;
    }

    getDisplayText(): string {
        return "Card Library";
    }

    getIcon(): string {
        return "calendar-with-checkmark";
    }

    async onOpen(): Promise<void> {
        try {
            this.root = ReactDOM.createRoot(this.contentEl);
            this.root.render(
                <React.StrictMode>
                    <App/>
                </React.StrictMode>
            );
        } catch (e) {
            console.log(e);
        }
    }

    onunload() {
        super.onunload();
        this.root.unmount();
    }
}

export default class CardLibrary extends Plugin {
    private view: CardLibraryView;

    async onload(): Promise<void> {
        this.registerView(
            VIEW_TYPE,
            (leaf: WorkspaceLeaf) => (this.view = new CardLibraryView(leaf))
        );

        this.app.workspace.onLayoutReady(this.onLayoutReady.bind(this));
    }

    async onLayoutReady(): Promise<void> {
        if (this.app.workspace.getLeavesOfType(VIEW_TYPE).length) {
            return;
        }
        await this.app.workspace.getRightLeaf(false).setViewState({
            type: VIEW_TYPE,
        });
    }
}
