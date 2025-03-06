import { ItemView, WorkspaceLeaf, MarkdownRenderer } from 'obsidian';
import { CodeBlockViewPlugin } from './main';

export const VIEW_TYPE = 'code-block-view';

export class CodeBlockView extends ItemView {
    plugin: CodeBlockViewPlugin;
    private selector: HTMLSelectElement;
    private previewContainer: HTMLElement;

    constructor(leaf: WorkspaceLeaf, plugin: CodeBlockViewPlugin) {
        super(leaf);
        this.plugin = plugin;
    }

    getViewType() { return VIEW_TYPE; }
    getDisplayText() { return 'Code Block Preview'; }

    async onOpen() {
        console.log(`[CodeBlockView] view onOpen`);
        const container = this.containerEl.children[1];
        container.empty();

        // 创建选择器
        this.selector = container.createEl("select", { cls: "blocks-selector" });
        this.previewContainer = container.createDiv("blocks-preview");

        this.updateSelector();
        this.renderPreview();
        this.selector.addEventListener("change", () => this.renderPreview());
    }

    updateSelector() {
        this.selector.empty();
        this.plugin.settings.queries.forEach(block => {
            this.selector.createEl("option", {
                text: block.name,
                value: block.name
            });
        });
    }

    async renderPreview() {
        const selectedBlock = this.plugin.settings.queries.find(
            b => b.name === this.selector.value
        );
        this.previewContainer.empty();

        if (selectedBlock) {
            MarkdownRenderer.render(
                this.app,
                selectedBlock.code, 
                this.previewContainer, 
                "", // 文件路径（可选）
                this // 插件实例上下文
              );
        }
    }
}