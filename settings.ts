import { App, PluginSettingTab, Setting, Notice, debounce, TextComponent, TextAreaComponent, ButtonComponent } from 'obsidian';
import { StickyNotesPlugin } from './main';
import { StickyNotesNote, StickyNotesSettings } from './data/types';

export const DEFAULT_SETTINGS: StickyNotesSettings = {
    notes: []
};

export class StickyNotesSettingTab extends PluginSettingTab {
    plugin: StickyNotesPlugin;
    private notesContainer: HTMLElement;

    constructor(app: App, plugin: StickyNotesPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        console.log("[StickyNotes] Rendering settings tab")

        const { containerEl } = this;
        containerEl.empty();

        const generateUniqueName = (notes: StickyNotesNote[]) => {
            const baseName = "Sticky Note";
            let maxNumber = 0;

            notes.forEach(q => {
                const match = q.name.match(new RegExp(`${baseName} (\\d+)`));
                if (match) maxNumber = Math.max(maxNumber, parseInt(match[1]));
            });

            return `${baseName} ${maxNumber + 1}`;
        };

        new Setting(containerEl)
            .setName('Manage Sticky Notes')
            .setDesc('Add/Edit sticky notes')
            .addButton(button => button
                .setButtonText('Add New')
                .onClick(() => {
                    this.plugin.settings.notes.push({
                        id: crypto.randomUUID(),
                        name: generateUniqueName(this.plugin.settings.notes),
                        content: ''
                    });
                    this.plugin.saveSettings();
                    this.display();
                }));

        this.notesContainer = containerEl.createDiv();
        this.renderNotes();
    }

    private renderNotes(): void {
        this.notesContainer.empty();
        this.plugin.settings.notes.forEach((note: StickyNotesNote) => {

            const noteE1 = this.notesContainer.createDiv('sticky-notes-note');

            // 头部：名称和删除按钮
            const headerEl = noteE1.createDiv('sticky-notes-note-header');
            // 名称输入框
            const nameInput = new TextComponent(headerEl)
                .setValue(note.name)
                .onChange(debounce(async (value) => {
                    if (!value.trim()) {
                        new Notice("Name is empty!");
                        return;
                    }
                    note.name = value;
                    await this.plugin.saveSettings();
                }, 500));
            // 删除按钮
            const deleteButton = new ButtonComponent(headerEl)
                .setIcon('trash')
                .setTooltip('Delete')
                .onClick(async () => {
                    this.plugin.settings.notes = this.plugin.settings.notes.filter((n: StickyNotesNote) => n.id !== note.id);
                    await this.plugin.saveSettings();
                    this.renderNotes();
                });
            // 内容输入区域
            const contentE1 = noteE1.createDiv('sticky-notes-note-content');
            const blockInput = new TextAreaComponent(contentE1)
                .setValue(note.content)
                .then(textArea => {
                    textArea.inputEl.rows = 8;
                    textArea.inputEl.style.width = '100%';
                })
                .onChange(debounce(async (value) => {
                    note.content = value;
                    await this.plugin.saveSettings();
                }, 500));
        });
    }
}