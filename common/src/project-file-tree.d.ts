import * as ignore from 'ignore';
import type { CodebuffFileSystem } from './types/filesystem';
import type { FileTreeNode } from './util/file';
export declare const DEFAULT_MAX_FILES = 10000;
export declare function getProjectFileTree(params: {
    projectRoot: string;
    maxFiles?: number;
    fs: CodebuffFileSystem;
}): Promise<FileTreeNode[]>;
export declare function parseGitignore(params: {
    fullDirPath: string;
    projectRoot: string;
    fs: CodebuffFileSystem;
}): Promise<ignore.Ignore>;
export declare function getAllFilePaths(nodes: FileTreeNode[], basePath?: string): string[];
export interface PathInfo {
    path: string;
    isDirectory: boolean;
}
export declare function getAllPathsWithDirectories(nodes: FileTreeNode[], basePath?: string): PathInfo[];
export declare function flattenTree(nodes: FileTreeNode[]): FileTreeNode[];
export declare function getLastReadFilePaths(flattenedNodes: FileTreeNode[], count: number): string[];
export declare function isFileIgnored(params: {
    filePath: string;
    projectRoot: string;
    fs: CodebuffFileSystem;
}): Promise<boolean>;
//# sourceMappingURL=project-file-tree.d.ts.map