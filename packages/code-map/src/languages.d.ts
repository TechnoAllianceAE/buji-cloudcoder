import './types';
import { Language, Parser, Query } from 'web-tree-sitter';
export interface LanguageConfig {
    extensions: string[];
    wasmFile: string;
    queryPathOrContent: string;
    parser?: Parser;
    query?: Query;
    language?: Language;
}
export interface RuntimeLanguageLoader {
    loadLanguage(wasmFile: string): Promise<Language>;
    initParser(): Promise<void>;
}
export declare const WASM_FILES: {
    readonly 'tree-sitter-c-sharp.wasm': "tree-sitter-c-sharp.wasm";
    readonly 'tree-sitter-cpp.wasm': "tree-sitter-cpp.wasm";
    readonly 'tree-sitter-go.wasm': "tree-sitter-go.wasm";
    readonly 'tree-sitter-java.wasm': "tree-sitter-java.wasm";
    readonly 'tree-sitter-javascript.wasm': "tree-sitter-javascript.wasm";
    readonly 'tree-sitter-python.wasm': "tree-sitter-python.wasm";
    readonly 'tree-sitter-ruby.wasm': "tree-sitter-ruby.wasm";
    readonly 'tree-sitter-rust.wasm': "tree-sitter-rust.wasm";
    readonly 'tree-sitter-tsx.wasm': "tree-sitter-tsx.wasm";
    readonly 'tree-sitter-typescript.wasm': "tree-sitter-typescript.wasm";
};
export declare const languageTable: LanguageConfig[];
/**
 * Set a custom WASM directory for loading tree-sitter WASM files.
 * This can be useful for custom packaging or deployment scenarios.
 */
export declare function setWasmDir(dir: string): void;
export declare function getWasmDir(): string | undefined;
export declare function findLanguageConfigByExtension(filePath: string): LanguageConfig | undefined;
export declare function createLanguageConfig(filePath: string, runtimeLoader: RuntimeLanguageLoader): Promise<LanguageConfig | undefined>;
export declare function getLanguageConfig(filePath: string): Promise<LanguageConfig | undefined>;
//# sourceMappingURL=languages.d.ts.map