import type { Model } from '@bcp/common/old-constants';
import type { TrackEventFn } from '@bcp/common/types/contracts/analytics';
import type { StreamChunk } from '@bcp/common/types/contracts/llm';
import type { Logger } from '@bcp/common/types/contracts/logger';
import type { PrintModeError, PrintModeText } from '@bcp/common/types/print-mode';
import type { PromptResult } from '@bcp/common/util/error';
export declare function processStreamWithTools(params: {
    stream: AsyncGenerator<StreamChunk, PromptResult<string | null>>;
    processors: Record<string, {
        onTagStart: (tagName: string, attributes: Record<string, string>) => void | Promise<void>;
        onTagEnd: (tagName: string, params: Record<string, any>) => void | Promise<void>;
    }>;
    defaultProcessor: (toolName: string) => {
        onTagStart: (tagName: string, attributes: Record<string, string>) => void | Promise<void>;
        onTagEnd: (tagName: string, params: Record<string, any>) => void | Promise<void>;
    };
    onResponseChunk: (chunk: PrintModeText | PrintModeError) => void;
    logger: Logger;
    loggerOptions?: {
        userId?: string;
        model?: Model;
        agentName?: string;
    };
    trackEvent: TrackEventFn;
    executeXmlToolCall: (params: {
        toolCallId: string;
        toolName: string;
        input: Record<string, unknown>;
    }) => Promise<void>;
}): AsyncGenerator<StreamChunk, PromptResult<string | null>>;
//# sourceMappingURL=tool-stream-parser.d.ts.map