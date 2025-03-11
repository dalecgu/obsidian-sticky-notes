import { ItemView, WorkspaceLeaf, MarkdownRenderer } from 'obsidian';
import { StickyNotesPlugin } from 'src/main';
import { StickyNotesNote } from 'src/data/types';

export const STICKY_NOTES_SELECTOR_VIEW_TYPE = 'sticky-notes-selector-view';
export const STICKY_NOTES_SINGLE_NOTE_VIEW_TYPE = 'sticky-notes-single-note-view-';

export class StickyNotesSelectorView extends ItemView {
    plugin: StickyNotesPlugin;
    private selector: HTMLSelectElement;
    private notesContainer: HTMLElement;

    constructor(leaf: WorkspaceLeaf, plugin: StickyNotesPlugin) {
        super(leaf);
        this.plugin = plugin;
    }

    getViewType() { return STICKY_NOTES_SELECTOR_VIEW_TYPE; }
    getDisplayText() { return 'Sticky Notes Selector View'; }
    getIcon() { return "notebook"; }

    async onOpen() {
        console.log(`[StickyNotes] selector view onOpen`);
        const container = this.containerEl.children[1];
        container.empty();

        // 创建选择器
        this.selector = container.createEl("select", { cls: "sticky-notes-selector" });
        this.notesContainer = container.createDiv("sticky-notes");

        this.updateSelector();
        this.renderNotes();
        this.selector.addEventListener("change", () => this.renderNotes());
    }

    updateSelector() {
        this.selector.empty();
        this.plugin.settings.notes.forEach((note: StickyNotesNote) => {
            this.selector.createEl("option", {
                text: note.name,
                value: note.name
            });
        });
    }

    async renderNotes() {
        const selectedNote = this.plugin.settings.notes.find(
            (note: StickyNotesNote) => note.name === this.selector.value
        );
        this.notesContainer.empty();

        if (selectedNote) {
            MarkdownRenderer.render(
                this.app,
                selectedNote.content,
                this.notesContainer,
                "", // 文件路径（可选）
                this // 插件实例上下文
            );
        }
    }
}

export class StickyNotesSingleNoteView extends ItemView {
    plugin: StickyNotesPlugin;
    note: StickyNotesNote;
    private notesContainer: HTMLElement;

    constructor(leaf: WorkspaceLeaf, plugin: StickyNotesPlugin, note: StickyNotesNote) {
        super(leaf);
        this.plugin = plugin;
        this.note = note;
    }

    getViewType() { return STICKY_NOTES_SINGLE_NOTE_VIEW_TYPE; }
    getDisplayText() { return this.note.name; }
    getIcon() { return "sticky-note"; }

    async onOpen() {
        console.log(`[StickyNotes] single note view onOpen`);
        const container = this.containerEl.children[1];
        container.empty();

        // 创建选择器
        this.notesContainer = container.createDiv("sticky-notes");

        this.renderNotes();
    }

    async renderNotes() {
        this.notesContainer.empty();

        MarkdownRenderer.render(
            this.app,
            this.note.content,
            this.notesContainer,
            "", // 文件路径（可选）
            this // 插件实例上下文
        );
    }
}