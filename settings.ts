import { App, PluginSettingTab, Setting, Notice, debounce, TextComponent, TextAreaComponent, ButtonComponent } from 'obsidian';
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

            const queryItemEl = this.queriesContainer.createDiv('codeblock-query-item');

            // 头部：名称和删除按钮
            const headerEl = queryItemEl.createDiv('codeblock-header');
            // 名称输入框
            const nameInput = new TextComponent(headerEl)
                .setPlaceholder('Code block name')
                .setValue(query.name)
                .onChange(debounce(async (value) => {
                    if (!value.trim()) {
                        new Notice("Name is empty!");
                        return;
                    }
                    query.name = value;
                    await this.plugin.saveSettings();
                }, 500));
            // 删除按钮
            const deleteButton = new ButtonComponent(headerEl)
                .setIcon('trash')
                .setTooltip('Delete')
                .onClick(async () => {
                    this.plugin.settings.queries = this.plugin.settings.queries.filter((q: CodeBlock) => q.id !== query.id);
                    await this.plugin.saveSettings();
                    this.renderQueries();
                });
            // 代码块输入区域
            const codeBlockEl = queryItemEl.createDiv('codeblock-content');
            const blockInput = new TextAreaComponent(codeBlockEl)
                .setPlaceholder('Code')
                .setValue(query.code)
                .then(textArea => {
                    textArea.inputEl.rows = 8;
                    textArea.inputEl.style.width = '100%';
                })
                .onChange(debounce(async (value) => {
                    query.code = value;
                    await this.plugin.saveSettings();
                }, 500));
        });
    }
}