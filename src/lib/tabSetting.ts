import { Setting } from 'obsidian';
import { CardLibrarySettingTab } from '@/cardLibrarySettings';

export default class TabSetting extends Setting {
    private settingTab: CardLibrarySettingTab;
    private name: string | DocumentFragment = '';
    private desc: string | DocumentFragment = '';

    constructor(containerEl: HTMLElement, settingTab: CardLibrarySettingTab) {
        super(containerEl);
        this.settingTab = settingTab;
    }

    setName(name: string | DocumentFragment): this {
        super.setName(name);
        this.name = name;
        return this;
    }

    setDesc(desc: string | DocumentFragment): this {
        super.setDesc(desc);
        this.desc = desc;
        return this;
    }

    setTab(tabName: string): this {
        const name = typeof this.name === 'string' ? this.name : this.name.textContent ?? '';
        const desc = typeof this.desc === 'string' ? this.desc : this.desc.textContent ?? '';

        this.settingTab.addSettingToMasterSettingsList(tabName, this.settingEl, name, desc);

        return this;
    }
}
