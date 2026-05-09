/**
 * Formats code search output to group matches by file.
 *
 * Input format: ./file.ts:line content
 * Output format:
 * ./file.ts:
 * line content
 * another line content
 * yet another line content
 *
 * (double newline between distinct files)
 *
 * @param stdout The raw stdout from ripgrep
 * @returns Formatted output with matches grouped by file
 */
export declare function formatCodeSearchOutput(stdout: string): string;
//# sourceMappingURL=format-code-search.d.ts.map