import { z } from 'zod/v4';
import type { CodebuffFileSystem } from '../types/filesystem';
import type { SkillsMap } from '../types/skill';
export declare const FileTreeNodeSchema: z.ZodType<FileTreeNode>;
export interface FileTreeNode {
    name: string;
    type: 'file' | 'directory';
    filePath: string;
    lastReadTime?: number;
    children?: FileTreeNode[];
}
export interface DirectoryNode extends FileTreeNode {
    type: 'directory';
    children: FileTreeNode[];
}
export interface FileNode extends FileTreeNode {
    type: 'file';
    lastReadTime: number;
}
export declare const FileVersionSchema: z.ZodObject<{
    path: z.ZodString;
    content: z.ZodString;
}, z.core.$strip>;
export type FileVersion = z.infer<typeof FileVersionSchema>;
export declare const customToolDefinitionsSchema: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodObject<{
    inputSchema: z.ZodCustom<Record<string, unknown> | z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>>, Record<string, unknown> | z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>>>;
    endsAgentStep: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    description: z.ZodOptional<z.ZodString>;
    exampleInputs: z.ZodOptional<z.ZodArray<z.ZodRecord<z.ZodString, z.ZodAny>>>;
}, z.core.$strip>>>;
export type CustomToolDefinitions = NonNullable<z.input<typeof customToolDefinitionsSchema>>;
export declare const ProjectFileContextSchema: z.ZodObject<{
    projectRoot: z.ZodString;
    cwd: z.ZodString;
    fileTree: z.ZodArray<z.ZodCustom<FileTreeNode, FileTreeNode>>;
    fileTokenScores: z.ZodRecord<z.ZodString, z.ZodRecord<z.ZodString, z.ZodNumber>>;
    tokenCallers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodRecord<z.ZodString, z.ZodArray<z.ZodString>>>>;
    knowledgeFiles: z.ZodRecord<z.ZodString, z.ZodString>;
    userKnowledgeFiles: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    agentTemplates: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>;
    customToolDefinitions: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodObject<{
        inputSchema: z.ZodCustom<Record<string, unknown> | z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>>, Record<string, unknown> | z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>>>;
        endsAgentStep: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        description: z.ZodOptional<z.ZodString>;
        exampleInputs: z.ZodOptional<z.ZodArray<z.ZodRecord<z.ZodString, z.ZodAny>>>;
    }, z.core.$strip>>>;
    skills: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    gitChanges: z.ZodObject<{
        status: z.ZodString;
        diff: z.ZodString;
        diffCached: z.ZodString;
        lastCommitMessages: z.ZodString;
    }, z.core.$strip>;
    changesSinceLastChat: z.ZodRecord<z.ZodString, z.ZodString>;
    shellConfigFiles: z.ZodRecord<z.ZodString, z.ZodString>;
    systemInfo: z.ZodObject<{
        platform: z.ZodString;
        shell: z.ZodString;
        nodeVersion: z.ZodString;
        arch: z.ZodString;
        homedir: z.ZodString;
        cpus: z.ZodNumber;
    }, z.core.$strip>;
}, z.core.$strip>;
export type ProjectFileContext = {
    projectRoot: string;
    cwd: string;
    fileTree: FileTreeNode[];
    fileTokenScores: Record<string, Record<string, number>>;
    tokenCallers?: Record<string, Record<string, string[]>>;
    knowledgeFiles: Record<string, string>;
    userKnowledgeFiles?: Record<string, string>;
    agentTemplates: Record<string, any>;
    customToolDefinitions: CustomToolDefinitions;
    skills?: SkillsMap;
    gitChanges: {
        status: string;
        diff: string;
        diffCached: string;
        lastCommitMessages: string;
    };
    changesSinceLastChat: Record<string, string>;
    shellConfigFiles: Record<string, string>;
    systemInfo: {
        platform: string;
        shell: string;
        nodeVersion: string;
        arch: string;
        homedir: string;
        cpus: number;
    };
};
export declare const fileRegex: RegExp;
export declare const fileWithNoPathRegex: RegExp;
export declare const parseFileBlocks: (fileBlocks: string) => Record<string, string>;
export declare const getStubProjectFileContext: () => ProjectFileContext;
export declare const createMarkdownFileBlock: (filePath: string, content: string) => string;
export declare const parseMarkdownCodeBlock: (content: string) => string;
export declare const createSearchReplaceBlock: (search: string, replace: string) => string;
export declare function printFileTree(nodes: FileTreeNode[], depth?: number): string;
export declare function printFileTreeWithTokens(nodes: FileTreeNode[], fileTokenScores: Record<string, Record<string, number>>, path?: string[]): string;
/**
 * Ensures the given file contents ends with a newline character.
 * @param contents - The file contents
 * @returns the file contents with a newline character.
 */
export declare const ensureEndsWithNewline: (contents: string | null) => string | null;
/**
 * Node-compatible file existence check.
 * Uses fs.stat instead of runtime-specific fs.exists.
 */
export declare function fileExists(params: {
    filePath: string;
    fs: CodebuffFileSystem;
}): Promise<boolean>;
export declare const ensureDirectoryExists: (params: {
    baseDir: string;
    fs: CodebuffFileSystem;
}) => Promise<void>;
/**
 * Removes markdown code block syntax if present, including any language tag
 */
export declare const cleanMarkdownCodeBlock: (content: string) => string;
export declare function isValidFilePath(path: string): boolean;
export declare function isDir(params: {
    path: string;
    fs: CodebuffFileSystem;
}): Promise<boolean>;
/**
 * Returns true if the `toPath` is a subdirectory of `fromPath`.
 */
export declare function isSubdir(fromPath: string, toPath: string): boolean;
export declare function isValidProjectRoot(dir: string): boolean;
//# sourceMappingURL=file.d.ts.map