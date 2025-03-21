import { App, PluginSettingTab, Setting, Notice, debounce, TextComponent, TextAreaComponent, ButtonComponent, SearchComponent } from 'obsidian';
import { StickyNotesPlugin } from 'src/main';
import { StickyNotesNote, StickyNotesSettings } from 'src/data/types';

export const DEFAULT_SETTINGS: StickyNotesSettings = {
    notes: []
};

export class StickyNotesSettingTab extends PluginSettingTab {
    plugin: StickyNotesPlugin;
    private notesContainer: HTMLElement;
    private searchComponent: SearchComponent;
    private filterString: string = '';
    private filteredNotes: number[];

    constructor(app: App, plugin: StickyNotesPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        new Setting(containerEl)
            .setName('Manage sticky notes')
            .addSearch((component: SearchComponent) => {
                this.searchComponent = component;
                component.setValue(this.filterString);
                component.onChange(debounce(
                    async (value) => {
                        this.filterString = value;
                        if (value) {
                            this.filter();
                        } else {
                            this.clearFilter();
                        }
                    }, 500
                ));
                component.setPlaceholder('Search notes');
            })
            .addButton(button => button
                .setButtonText('Add new')
                .onClick(() => {
                    this.plugin.addNote('');
                    this.clearFilter();
                }));

        this.notesContainer = containerEl.createDiv();
        this.filter();
    }

    private renderNotes(): void {
        this.notesContainer.empty();
        this.filteredNotes.forEach((index: number) => {
            const note = this.plugin.settings.notes[index];
            const noteE1 = this.notesContainer.createDiv('sticky-notes-note');

            // 头部：名称和删除按钮
            const headerEl = noteE1.createDiv('sticky-notes-note-header');
            // 名称输入框
            const nameInput = new TextComponent(headerEl)
                .setValue(note.name)
                .onChange(debounce(async (value) => {
                    if (!value.trim()) {
                        new Notice("Name is empty");
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
                    this.filter();
                });
            // 内容输入区域
            const contentE1 = noteE1.createDiv('sticky-notes-note-content');
            const blockInput = new TextAreaComponent(contentE1)
                .setValue(note.content)
                .then(textArea => {
                    textArea.inputEl.rows = 8;
                })
                .onChange(debounce(async (value) => {
                    note.content = value;
                    await this.plugin.saveSettings();
                }, 500));
        });
    }

    private filter() {
        this.filteredNotes = []
        this.plugin.settings.notes.forEach((note: StickyNotesNote, index: number) => {
            if (this.filterString) {
                if (note.name.contains(this.filterString) || note.content.contains(this.filterString)) {
                    this.filteredNotes.push(index)
                }
            } else {
                this.filteredNotes.push(index)
            }
        })
        this.renderNotes();
    }

    private clearFilter() {
        this.filterString = '';
        this.searchComponent.setValue(this.filterString);
        this.filter();
    }
}