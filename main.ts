import { Plugin, WorkspaceLeaf } from 'obsidian';
import { StickyNotesSettingTab, DEFAULT_SETTINGS } from './settings';
import { StickyNotesSelectorView, STICKY_NOTES_SELECTOR_VIEW_TYPE } from './view';
import { StickyNotesSettings } from './data/types';

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

		// 添加侧边栏按钮
		this.addRibbonIcon('notebook', 'Open Sticky Notes Selector View', () => {
			this.activateView();
		});

		// 注册设置标签页
		this.addSettingTab(new StickyNotesSettingTab(this.app, this));
		console.log("[StickyNotes] Setting tab registered");

		this.addCommand({
			id: "open-sticky-notes-selector-view",
			name: "Open Sticky Notes Selector View",
			callback: () => {
			  this.activateView();
			},
		  });
	}

	private async activateView() {
		const { workspace } = this.app;
		let leaf: WorkspaceLeaf | null = null;
		const leaves = workspace.getLeavesOfType(STICKY_NOTES_SELECTOR_VIEW_TYPE);

		if (leaves.length > 0) {
			leaf = leaves[0];
		} else {
			leaf = workspace.getRightLeaf(false);
			await leaf?.setViewState({
				type: STICKY_NOTES_SELECTOR_VIEW_TYPE,
				active: true,
			});
		}
		if (leaf) workspace.revealLeaf(leaf);
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}