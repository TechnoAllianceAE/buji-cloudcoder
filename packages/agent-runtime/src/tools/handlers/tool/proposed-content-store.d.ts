/**
 * Store for proposed file content by runId.
 * This allows propose_str_replace and propose_write_file tools to
 * track proposed changes within an agent run, isolated by runId.
 */
/**
 * Get the proposed content map for a specific runId.
 * Creates an empty record if none exists.
 */
export declare function getProposedContentForRun(runId: string): Record<string, Promise<string | null>>;
/**
 * Get proposed content for a specific file in a run.
 */
export declare function getProposedContent(runId: string, path: string): Promise<string | null> | undefined;
/**
 * Set proposed content for a specific file in a run.
 */
export declare function setProposedContent(runId: string, path: string, content: Promise<string | null>): void;
/**
 * Clear all proposed content for a specific runId.
 * Should be called when an agent run completes.
 */
export declare function clearProposedContentForRun(runId: string): void;
/**
 * Clear all proposed content (for testing purposes).
 */
export declare function clearAllProposedContent(): void;
//# sourceMappingURL=proposed-content-store.d.ts.map