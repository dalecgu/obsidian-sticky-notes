import { App, PluginSettingTab, Setting } from 'obsidian';
import { CodeBlockViewPlugin } from './main';
import { CodeBlockViewSettings } from './data/types';

export const DEFAULT_SETTINGS: CodeBlockViewSettings = {
    queries: []
};

export class CodeBlockViewSettingTab extends PluginSettingTab {
    plugin: CodeBlockViewPlugin;

    constructor(app: App, plugin: CodeBlockViewPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        console.log("[CodeBlockView] Rendering settings tab")
        
        const { containerEl } = this;
        containerEl.empty();

        new Setting(containerEl)
            .setName('Manage Code Blocks')
            .setDesc('Add/Edit code blocks')
            .addButton(button => button
                .setButtonText('Add New')
                .onClick(() => {
                    this.plugin.settings.queries.push({
                        name: `Code block ${this.plugin.settings.queries.length + 1}`,
                        code: '```tasks\nnot done\n```'
                    });
                    this.plugin.saveSettings();
                    this.display();
                }));

        this.plugin.settings.queries.forEach((query, index) => {
            const setting = new Setting(containerEl)
                .addText(text => text
                    .setPlaceholder('Code block name')
                    .setValue(query.name)
                    .onChange(async (value) => {
                        query.name = value;
                        await this.plugin.saveSettings();
                    }))
                .addTextArea(text => text
                    .setPlaceholder('Code')
                    .setValue(query.code)
                    .onChange(async (value) => {
                        query.code = value;
                        await this.plugin.saveSettings();
                    }))
                .addExtraButton(btn => btn
                    .setIcon('trash')
                    .onClick(async () => {
                        this.plugin.settings.queries.splice(index, 1);
                        await this.plugin.saveSettings();
                        this.display();
                    }));
        });
    }
}