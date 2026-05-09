import { toolParams } from './list';
import type { ToolName } from './constants';
import type z from 'zod/v4';
export declare function getToolCallString<T extends ToolName | (string & {})>(toolName: T, input: T extends ToolName ? z.input<(typeof toolParams)[T]['inputSchema']> : Record<string, any>, ...endsAgentStep: T extends ToolName ? [] : [boolean]): string;
//# sourceMappingURL=utils.d.ts.map