import { ItemView, WorkspaceLeaf, MarkdownRenderer, ViewStateResult } from 'obsidian';
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
    getDisplayText() { return 'Sticky notes'; }
    getIcon() { return "notebook"; }

    async onOpen() {
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
    private note: StickyNotesNote;
    private notesContainer: HTMLElement;

    constructor(leaf: WorkspaceLeaf, plugin: StickyNotesPlugin) {
        super(leaf);
        this.plugin = plugin;
    }

    getViewType() { return STICKY_NOTES_SINGLE_NOTE_VIEW_TYPE; }
    getDisplayText() {
        if (this.note) {
            return this.note.name;
        }
        return "Sticky note";
    }
    getIcon() { return "sticky-note"; }

    async onOpen() {
        const container = this.containerEl.children[1];
        container.empty();

        this.notesContainer = container.createDiv("sticky-notes");
    }

    getState(): Record<string, unknown> {
        let state = super.getState();
        state.note = this.note;
        return state;
    }

    async setState(state: Record<string, unknown>, result: ViewStateResult): Promise<void> {
        this.note = state.note as StickyNotesNote;
        if (this.note) {
            this.renderNotes();
        }
        await super.setState(state, result);
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