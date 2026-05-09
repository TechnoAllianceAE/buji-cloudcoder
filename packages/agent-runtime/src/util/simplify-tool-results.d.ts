import type { CodebuffToolOutput } from '@bcp/common/tools/list';
import type { Logger } from '@bcp/common/types/contracts/logger';
export declare function simplifyReadFileResults(messageContent: CodebuffToolOutput<'read_files'>): CodebuffToolOutput<'read_files'>;
export declare function simplifyTerminalCommandResults(params: {
    messageContent: CodebuffToolOutput<'run_terminal_command'>;
    logger: Logger;
}): CodebuffToolOutput<'run_terminal_command'>;
//# sourceMappingURL=simplify-tool-results.d.ts.map