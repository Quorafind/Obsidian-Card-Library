import { App, Platform, PluginSettingTab, SearchComponent, setIcon, Setting, } from 'obsidian';
import type CardLibrary from './cardLibraryIndex';
import { t } from './translations/helper';
import '@/less/setting-page.less';
import TabSetting from "@/lib/tabSetting";
import { CardLibrarySettings, SearchOptionInfo, settingSearchInfo, TabContentInfo, TabName } from "@/types/settings";

const tabNameToTabIconId: Record<TabName, string> = {
    General: 'chef-hat',
    Cards: 'file',
    Theme: 'brush',
    Output: 'share-2',
};

export const DEFAULT_SETTINGS: CardLibrarySettings = {
    general: {
        targetFolder: 'cards',
        defaultFileName: 'card-{{date}}',
        sortCardsBy: 'created',
    },
    cards: {
        useTemplate: false,
        templatePath: '',
    },
    theme: {
        colorScheme: 'default',
        lightBgImage: '',
        darkBgImage: '',
    },
    output: {
        exportType: 'md',
        exportPath: '',
        exportFileName: 'cards-{{date}}',
        exportTemplate: '',
    }
};

export class CardLibrarySettingTab extends PluginSettingTab {
    plugin: CardLibrary;
    //eslint-disable-next-line
    private applyDebounceTimer: number = 0;
    private tabContent: Map<string, TabContentInfo> = new Map<string, TabContentInfo>();
    private selectedTab = 'General';
    private search: SearchComponent | undefined;
    private searchSettingInfo: Map<string, settingSearchInfo[]> = new Map();
    private searchZeroState: HTMLDivElement | undefined;
    private navigateEl: HTMLElement | undefined;

    constructor(app: App, plugin: CardLibrary) {
        super(app, plugin);
        this.plugin = plugin;
    }

    updateSettings(key: any, value: any) {
        this.plugin.settings = {
            ...this.plugin.settings,
            [key]: value,
        };
        this.applySettingsUpdate();
    }

    applySettingsUpdate() {
        clearTimeout(this.applyDebounceTimer);
        const plugin = this.plugin;
        this.applyDebounceTimer = window.setTimeout(() => {
            plugin.saveSettings();
        }, 100);
    }

    //eslint-disable-next-line
    async hide() {
    }

    async display() {
        await this.plugin.loadSettings();

        this.containerEl.empty();
        this.containerEl.toggleClass('card-library-settings', true);
        if (Platform.isMobile) {
            this.containerEl.toggleClass('card-library-mobile', true);
        }

        this.generateSettingsTitle();
        this.addTabHeader();
    }

    private generateSettingsTitle() {
        const linterHeader = this.containerEl.createDiv('card-library-setting-title');
        linterHeader.createEl('h2', {text: 'Card library'});
        this.generateSearchBar(linterHeader);
    }

    private addTabHeader() {
        const navContainer = this.containerEl.createEl('nav', {cls: 'card-library-setting-header'});
        this.navigateEl = navContainer.createDiv('card-library-setting-tab-group');
        const settingsEl = this.containerEl.createDiv('card-library-setting-content');

        this.createTabAndContent('General', this.navigateEl, settingsEl, (el: HTMLElement, tabName: string) =>
            this.generateGeneralSettings(tabName, el),
        );
        this.createTabAndContent('Cards', this.navigateEl, settingsEl, (el: HTMLElement, tabName: string) =>
            this.generateCardsSettings(tabName, el),
        );
        this.createTabAndContent('Theme', this.navigateEl, settingsEl, (el: HTMLElement, tabName: string) =>
            this.generateThemeSettings(tabName, el),
        );
        this.createTabAndContent('Output', this.navigateEl, settingsEl, (el: HTMLElement, tabName: string) =>
            this.generateOutputSettings(tabName, el),
        );
        this.createSearchZeroState(settingsEl);
    }

    generateSearchBar(containerEl: HTMLElement) {
        // based on https://github.com/valentine195/obsidian-settings-search/blob/master/src/main.ts#L294-L308
        const searchSetting = new Setting(containerEl);
        searchSetting.settingEl.style.border = 'none';
        searchSetting.addSearch((s: SearchComponent) => {
            this.search = s;
        });

        this.search.setPlaceholder(t.settings.title);

        this.search.inputEl.oninput = () => {
            for (const tabInfo of this.tabContent) {
                const tab = tabInfo[1];
                tab.navButton.removeClass('card-library-navigation-item-selected');
                (tab.content as HTMLElement).show();
                (tab.heading as HTMLElement).show();

                const searchVal = this.search.getValue();
                if (this.selectedTab == '' && searchVal.trim() != '') {
                    this.searchSettings(searchVal.toLowerCase());
                }

                this.selectedTab = '';
            }
            this.navigateEl.addClass('card-library-setting-searching');
        };

        this.search.inputEl.onblur = () => {
            this.navigateEl.removeClass('card-library-setting-searching');
        };

        this.search.onChange((value: string) => {
            if (value === '') {
                this.triggerTabChange(this.tabContent.get('General')?.navButton as HTMLElement, 'General');
                return;
            }
            this.searchSettings(value.toLowerCase());
        });
    }

    triggerTabChange(tabEl: HTMLElement, tabName: TabName) {
        if (this.selectedTab == tabName) {
            return;
        }

        console.log(tabName, tabEl, this.selectedTab);

        tabEl.toggleClass('card-library-navigation-item-selected', true);
        const tab = this.tabContent.get(tabName);
        (tab?.content as HTMLElement).show();

        if (this.selectedTab != '') {
            const tabInfo = this.tabContent.get(this.selectedTab);
            tabInfo?.navButton.removeClass('card-library-navigation-item-selected');
            (tabInfo?.content as HTMLElement).hide();
        } else {
            (this.searchZeroState as HTMLElement).hide();

            for (const settingTab of this.searchSettingInfo) {
                for (const setting of settingTab[1]) {
                    (setting.containerEl as HTMLElement).show();
                }
            }

            for (const tabInfo of this.tabContent) {
                const tab = tabInfo[1];
                (tab.heading as HTMLElement).hide();
                if (tabName !== tabInfo[0]) {
                    (tab.content as HTMLElement).hide();
                }
            }
        }

        this.selectedTab = tabName;
    }

    createTabAndContent(
        tabName: TabName,
        navigateEl: HTMLElement,
        containerEl: HTMLElement,
        generateTabContent?: (el: HTMLElement, tabName: string) => void,
    ) {
        const displayTabContent = this.selectedTab === tabName;
        const tabEl = navigateEl.createDiv('card-library-navigation-item');

        tabEl.toggleClass('card-library-desktop', true);

        setIcon(tabEl.createEl('div', {cls: 'card-library-navigation-item-icon'}), tabNameToTabIconId[tabName]);
        tabEl.createSpan({
            text: t.settings[tabName.toLowerCase()],
        });

        tabEl.onclick = () => {
            this.triggerTabChange(tabEl, tabName);
        };

        const tabContent = containerEl.createDiv('card-library-tab-settings');

        const tabHeader = tabContent.createEl('h2', {cls: 'card-library-setting-heading', text: tabName + ' Settings'});
        (tabHeader as HTMLElement).hide();

        tabContent.id = tabName.toLowerCase().replace(' ', '-');
        if (!displayTabContent) {
            (tabContent as HTMLElement).hide();
        } else {
            tabEl.addClass('card-library-navigation-item-selected');
        }

        if (generateTabContent) {
            generateTabContent(tabContent, tabName);
        }

        this.tabContent.set(tabName, {content: tabContent, heading: tabHeader, navButton: tabEl});
    }

    private searchSettings(searchVal: string) {
        const tabsWithSettingsInSearchResults = new Set<string>();
        const showSearchResultAndAddTabToResultList = (settingContainer: HTMLElement, tabName: string) => {
            (settingContainer as HTMLElement).show();

            if (!tabsWithSettingsInSearchResults.has(tabName)) {
                tabsWithSettingsInSearchResults.add(tabName);
            }
        };

        for (const tabSettingInfo of this.searchSettingInfo) {
            const tabName = tabSettingInfo[0];
            const tabSettings = tabSettingInfo[1];
            for (const settingInfo of tabSettings) {
                if (
                    searchVal.trim() === '' ||
                    settingInfo.alias?.includes(searchVal) ||
                    settingInfo.description.includes(searchVal) ||
                    settingInfo.name.includes(searchVal)
                ) {
                    showSearchResultAndAddTabToResultList(settingInfo.containerEl, tabName);
                } else if (settingInfo.options && settingInfo.options.length > 0) {
                    for (const optionInfo of settingInfo.options) {
                        if (
                            optionInfo.description.toLowerCase().includes(searchVal) ||
                            optionInfo.name.toLowerCase().includes(searchVal)
                        ) {
                            showSearchResultAndAddTabToResultList(settingInfo.containerEl, tabName);

                            break;
                        } else if (optionInfo.options) {
                            for (const optionsForOption of optionInfo.options) {
                                if (
                                    optionsForOption.description.toLowerCase().includes(searchVal) ||
                                    optionsForOption.value.toLowerCase().includes(searchVal)
                                ) {
                                    showSearchResultAndAddTabToResultList(settingInfo.containerEl, tabName);

                                    break;
                                }
                            }
                        }

                        (settingInfo.containerEl as HTMLElement).hide();
                    }
                } else {
                    (settingInfo.containerEl as HTMLElement).hide();
                }
            }
        }

        // display any headings that have setting results and hide any that do not
        for (const tabInfo of this.tabContent) {
            if (tabsWithSettingsInSearchResults.has(tabInfo[0])) {
                (tabInfo[1].heading as HTMLElement).show();
            } else {
                (tabInfo[1].heading as HTMLElement).hide();
            }
        }

        if (tabsWithSettingsInSearchResults.size === 0) {
            (this.searchZeroState as HTMLElement).show();
        } else {
            (this.searchZeroState as HTMLElement).hide();
        }
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    addSettingToMasterSettingsList(
        tabName: string,
        containerEl: HTMLElement,
        name = '',
        description = '',
        options: SearchOptionInfo[] = [],
        alias = '',
    ) {
        const settingInfo = {
            containerEl: containerEl,
            name: name.toLowerCase(),
            description: description.toLowerCase(),
            options: options,
            alias: alias,
        };

        if (!this.searchSettingInfo.has(tabName)) {
            this.searchSettingInfo.set(tabName, [settingInfo]);
        } else {
            this.searchSettingInfo.get(tabName)?.push(settingInfo);
        }
    }

    private createSearchZeroState(containerEl: HTMLElement) {
        this.searchZeroState = containerEl.createDiv();
        (this.searchZeroState as HTMLElement).hide();
        this.searchZeroState.createEl(Platform.isMobile ? 'h3' : 'h2', {
            text: 'No settings match search',
        }).style.textAlign = 'center';
    }

    private generateGeneralSettings(tabName: string, memosContainerEl: HTMLElement) {
        this.customHeading(tabName, memosContainerEl);
    }

    private generateThemeSettings(tabName: string, memosContainerEl: HTMLElement) {
        this.customNameAndTheme(tabName, memosContainerEl);
    }

    private generateCardsSettings(tabName: string, memosContainerEl: HTMLElement) {
        this.addCardSettings(tabName, memosContainerEl);
    }

    private generateOutputSettings(tabName: string, memosContainerEl: HTMLElement) {
        this.outputMemoSettings(tabName, memosContainerEl);
    }

    private async customNameAndTheme(tabName: string, memosContainerEl: HTMLElement) {
        new TabSetting(memosContainerEl, this).setTab(tabName).setName('Color Scheme').setDesc('Select a color scheme for the card library.').addDropdown((dropdown) => {
            dropdown
                .addOption('default', 'Default')
                .addOption('dark', 'Dark')
                .addOption('light', 'Light')
                .setValue(this.plugin.settings.theme.colorScheme)
                .onChange(async (value) => {
                    this.updateSettings('theme.colorScheme', value);
                });
        });
    }

    private customHeading(tabName: string, memosContainerEl: HTMLElement) {
        new TabSetting(memosContainerEl, this).setTab(tabName).setName('Color Scheme').setDesc('Select a color scheme for the card library.').addDropdown((dropdown) => {
            dropdown
                .addOption('default', 'Default')
                .addOption('dark', 'Dark')
                .addOption('light', 'Light')
                .setValue(this.plugin.settings.theme.colorScheme)
                .onChange(async (value) => {
                    this.updateSettings('theme.colorScheme', value);
                });
        });
    }

    private addCardSettings(tabName: string, memosContainerEl: HTMLElement) {
        new TabSetting(memosContainerEl, this).setTab(tabName).setName('Color Scheme').setDesc('Select a color scheme for the card library.').addDropdown((dropdown) => {
            dropdown
                .addOption('default', 'Default')
                .addOption('dark', 'Dark')
                .addOption('light', 'Light')
                .setValue(this.plugin.settings.theme.colorScheme)
                .onChange(async (value) => {
                    this.updateSettings('theme.colorScheme', value);
                });
        });
    }

    private outputMemoSettings(tabName: string, memosContainerEl: HTMLElement) {
        new TabSetting(memosContainerEl, this).setTab(tabName).setName('Color Scheme').setDesc('Select a color scheme for the card library.').addDropdown((dropdown) => {
            dropdown
                .addOption('default', 'Default')
                .addOption('dark', 'Dark')
                .addOption('light', 'Light')
                .setValue(this.plugin.settings.theme.colorScheme)
                .onChange(async (value) => {
                    this.updateSettings('theme.colorScheme', value);
                });
        });
    }
}
