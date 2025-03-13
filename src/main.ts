import { Plugin, WorkspaceLeaf, Editor, Notice } from 'obsidian';
import { StickyNotesSettingTab, DEFAULT_SETTINGS } from 'src/settings/settings';
import { StickyNotesSelectorView, STICKY_NOTES_SELECTOR_VIEW_TYPE, StickyNotesSingleNoteView, STICKY_NOTES_SINGLE_NOTE_VIEW_TYPE } from 'src/view/view';
import { StickyNotesNote, StickyNotesSettings } from 'src/data/types';

export default class StickyNotesPlugin extends Plugin {
	settings: StickyNotesSettings;

	async onload() {
		console.log("[StickyNotes] Plugin loading...");

		// 加载设置
		await this.loadSettings();

		// 注册视图
		this.registerView(
			STICKY_NOTES_SELECTOR_VIEW_TYPE,
			(leaf) => new StickyNotesSelectorView(leaf, this)
		);

		this.addCommand({
			id: "open-sticky-notes-selector-view",
			name: "Open Selector View",
			callback: () => {
				this.activateView(STICKY_NOTES_SELECTOR_VIEW_TYPE);
			},
		});

		// 添加侧边栏按钮
		this.addRibbonIcon('notebook', 'Open Sticky Notes Selector View', () => {
			this.activateView(STICKY_NOTES_SELECTOR_VIEW_TYPE);
		});

		this.registerView(
			STICKY_NOTES_SINGLE_NOTE_VIEW_TYPE,
			(leaf) => {
				return new StickyNotesSingleNoteView(leaf, this);
			}
		);

		this.settings.notes.forEach((note: StickyNotesNote) => {
			this.addCommand({
				id: "open-sticky-notes-single-note-view-" + note.id,
				name: "Open Single Note View " + note.name,
				callback: () => {
					this.activateSingleNoteView(STICKY_NOTES_SINGLE_NOTE_VIEW_TYPE, note);
				},
			});
		});

		// 注册设置标签页
		this.addSettingTab(new StickyNotesSettingTab(this.app, this));
		console.log("[StickyNotes] Setting tab registered");

		this.addCommand({
			id: "save-selected-content-as-sticky-note",
			name: "Save Selected Content As Sticky Note",
			editorCheckCallback: (checking: Boolean, editor: Editor) => {
				const selection = editor.getSelection();
				if (selection) {
					if (!checking) {
						this.addNote(selection)
						new Notice('Sticky Note: Saved!');
					}
					return true;
				}
				return false;
			}
		});

		this.registerEvent(
			this.app.workspace.on('editor-menu', (menu, editor, view) => {
				const selection = editor.getSelection();
				if (selection && selection.trim().length > 0) {
					menu.addItem((item) => {
						item
							.setTitle("Save Selected Content As Sticky Note")
							.setIcon("save")
							.onClick(async () => {
								await this.addNote(selection);
								new Notice('Sticky Note: Saved!');
							});
					});
				}
			})
		);
	}

	private async activateView(viewType: string) {
		const { workspace } = this.app;
		let leaf: WorkspaceLeaf | null = null;
		const leaves = workspace.getLeavesOfType(viewType);

		if (leaves.length > 0) {
			leaf = leaves[0];
		} else {
			leaf = workspace.getRightLeaf(false);
			await leaf?.setViewState({
				type: viewType,
				active: true,
			});
		}
		if (leaf) workspace.revealLeaf(leaf);
	}

	private async activateSingleNoteView(viewType: string, note: StickyNotesNote) {
		const { workspace } = this.app;
		let leaf: WorkspaceLeaf | null = null;
		const leaves = workspace.getLeavesOfType(viewType);

		for (var l of leaves) {
			if (l) {
				const view = l.view as StickyNotesSingleNoteView;
				const state = view.getState();
				if ((state.note as StickyNotesNote).id == note.id) {
					leaf = l;
				}
			}
		}
		if (!leaf) {
			leaf = workspace.getRightLeaf(false);
			await leaf?.setViewState({
				type: viewType,
				active: true,
			});
			if (leaf) {
				const view = leaf.view as StickyNotesSingleNoteView;
				const state = view.getState();
				state.note = note;
				view.setState(state, { history: false });
			}
		}
		if (leaf) {
			workspace.revealLeaf(leaf);
		}
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async addNote(c: string) {
		const generateUniqueName = (notes: StickyNotesNote[]) => {
			const baseName = "Sticky Note";
			let maxNumber = 0;

			notes.forEach(q => {
				const match = q.name.match(new RegExp(`${baseName} (\\d+)`));
				if (match) maxNumber = Math.max(maxNumber, parseInt(match[1]));
			});

			return `${baseName} ${maxNumber + 1}`;
		};

		this.settings.notes.unshift({
			id: crypto.randomUUID(),
			name: generateUniqueName(this.settings.notes),
			content: c
		});
		await this.saveSettings();
	}
}