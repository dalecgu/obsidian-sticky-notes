export interface CodeBlock {
    /**
     * 查询名称（用户自定义）
     */
    name: string;

    /**
     * Tasks 插件查询代码块内容
     * 示例： 
     * ```tasks
     * not done
     * ```
     */
    code: string;
}

export interface CodeBlockViewSettings {
    /**
     * 存储所有的查询配置
     */
    queries: CodeBlock[];
}