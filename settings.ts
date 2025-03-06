import { App, PluginSettingTab, Setting, Notice, debounce } from 'obsidian';
import { CodeBlockViewPlugin } from './main';
import { CodeBlock, CodeBlockViewSettings } from './data/types';

export const DEFAULT_SETTINGS: CodeBlockViewSettings = {
    queries: []
};

export class CodeBlockViewSettingTab extends PluginSettingTab {
    plugin: CodeBlockViewPlugin;
    private queriesContainer: HTMLElement;

    constructor(app: App, plugin: CodeBlockViewPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        console.log("[CodeBlockView] Rendering settings tab")

        const { containerEl } = this;
        containerEl.empty();

        const generateUniqueName = (queries: CodeBlock[]) => {
            const baseName = "Code block";
            let maxNumber = 0;

            queries.forEach(q => {
                const match = q.name.match(new RegExp(`${baseName} (\\d+)`));
                if (match) maxNumber = Math.max(maxNumber, parseInt(match[1]));
            });

            return `${baseName} ${maxNumber + 1}`;
        };

        new Setting(containerEl)
            .setName('Manage Code Blocks')
            .setDesc('Add/Edit code blocks')
            .addButton(button => button
                .setButtonText('Add New')
                .onClick(() => {
                    this.plugin.settings.queries.push({
                        id: crypto.randomUUID(),
                        name: generateUniqueName(this.plugin.settings.queries),
                        code: '```tasks\nnot done\n```'
                    });
                    this.plugin.saveSettings();
                    this.display();
                }));

        this.queriesContainer = containerEl.createDiv();
        this.renderQueries();
    }

    private renderQueries(): void {
        this.queriesContainer.empty();
        this.plugin.settings.queries.forEach((query: CodeBlock) => {
            const setting = new Setting(this.queriesContainer)
                .setName(query.id)
                .setDesc("please input name and code block")
                .addText(text => {
                    text
                        .setPlaceholder('Code block name')
                        .setValue(query.name)
                        .onChange(debounce(async (value) => {
                            if (!value.trim()) {
                                new Notice("名称不能为空");
                                return;
                            }
                            query.name = value;
                            await this.plugin.saveSettings();
                        }, 500));
                    text.inputEl.style.width = "100%";
                })
                .addTextArea(text => text
                    .setPlaceholder('Code')
                    .setValue(query.code)
                    .then(textArea => {
                        textArea.inputEl.style.width = "100%";
                        textArea.inputEl.style.margin = "0";
                        textArea.inputEl.style.padding = "0";
                        textArea.inputEl.rows = 10;
                    })
                    .onChange(debounce(async (value) => {
                        query.code = value;
                        await this.plugin.saveSettings();
                    }, 500)))
                .addExtraButton(btn => btn
                    .setIcon('trash')
                    .onClick(async () => {
                        this.plugin.settings.queries = this.plugin.settings.queries.filter((q: CodeBlock) => q.id !== query.id);
                        await this.plugin.saveSettings();
                        this.renderQueries();
                    }));

            setting.controlEl.style.flexDirection = 'column';
            setting.controlEl.style.alignItems = 'flex-start';
            setting.controlEl.style.gap = '8px';
            setting.controlEl.querySelectorAll('.setting-item-control').forEach(el => {
                (el as HTMLElement).style.width = '100%';
            });

            setting.settingEl.createEl('hr', { cls: 'codeblock-divider' });
        });
    }
}