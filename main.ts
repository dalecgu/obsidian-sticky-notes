import { Plugin, WorkspaceLeaf } from 'obsidian';
import { CodeBlockViewSettingTab, DEFAULT_SETTINGS } from './settings';
import { CodeBlockView, VIEW_TYPE } from './view';
import { CodeBlockViewSettings } from './data/types';

export default class CodeBlockViewPlugin extends Plugin {
	settings: CodeBlockViewSettings;

	async onload() {
		console.log("[CodeBlockView] Plugin loading...");

		// 加载设置
		await this.loadSettings();

		// 注册视图
		this.registerView(
			VIEW_TYPE,
			(leaf) => new CodeBlockView(leaf, this)
		);

		// 添加侧边栏按钮
		this.addRibbonIcon('eye', 'Open Code Block View', () => {
			this.activateView();
		});

		// 注册设置标签页
		this.addSettingTab(new CodeBlockViewSettingTab(this.app, this));
		console.log("[CodeBlockView] Setting tab registered");

		this.addCommand({
			id: "open-code-block-view",
			name: "Open Code Block View",
			callback: () => {
			  this.activateView();
			},
		  });
	}

	private async activateView() {
		const { workspace } = this.app;
		let leaf: WorkspaceLeaf | null = null;
		const leaves = workspace.getLeavesOfType(VIEW_TYPE);

		if (leaves.length > 0) {
			leaf = leaves[0];
		} else {
			leaf = workspace.getRightLeaf(false);
			await leaf?.setViewState({
				type: VIEW_TYPE,
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