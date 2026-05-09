/**
 * The primary/default knowledge file name.
 * Used when creating new knowledge files.
 */
export declare const PRIMARY_KNOWLEDGE_FILE_NAME = "knowledge.md";
/**
 * Knowledge file names in priority order (highest priority first).
 * Used for both project knowledge files and home directory user knowledge files.
 */
export declare const KNOWLEDGE_FILE_NAMES: readonly ["knowledge.md", "AGENTS.md", "CLAUDE.md"];
/**
 * Pre-computed lowercase knowledge file names for efficient matching.
 */
export declare const KNOWLEDGE_FILE_NAMES_LOWERCASE: string[];
/**
 * Checks if a file path is a knowledge file.
 * Matches:
 * - Exact file names: knowledge.md, AGENTS.md, CLAUDE.md (case-insensitive)
 * - Pattern: *.knowledge.md (e.g., authentication.knowledge.md)
 * - Files inside .kiro/ directory (e.g., .kiro/rules.md, .kiro/context.md)
 * - Files inside .agents/ directory (e.g., .agents/config.md)
 */
export declare function isKnowledgeFile(filePath: string): boolean;
//# sourceMappingURL=knowledge.d.ts.map