import { type FinetunedVertexModel } from '@bcp/common/old-constants';
import { promptFlashWithFallbacks } from '../llm-api/gemini-with-fallbacks';
import type { TextBlock } from '../llm-api/claude';
import type { PromptAiSdkFn } from '@bcp/common/types/contracts/llm';
import type { Logger } from '@bcp/common/types/contracts/logger';
import type { ParamsExcluding } from '@bcp/common/types/function-params';
import type { Message } from '@bcp/common/types/messages/bcp-message';
import type { ProjectFileContext } from '@bcp/common/util/file';
export declare function requestRelevantFiles(params: {
    messages: Message[];
    system: string | Array<TextBlock>;
    fileContext: ProjectFileContext;
    assistantPrompt: string | null;
    agentStepId: string;
    clientSessionId: string;
    fingerprintId: string;
    userInputId: string;
    userId: string | undefined;
    repoId: string | undefined;
    logger: Logger;
} & ParamsExcluding<typeof getRelevantFiles, 'messages' | 'userPrompt' | 'requestType' | 'modelId'>): Promise<string[]>;
export declare function requestRelevantFilesForTraining(params: {
    messages: Message[];
    fileContext: ProjectFileContext;
    assistantPrompt: string | null;
    logger: Logger;
} & ParamsExcluding<typeof getRelevantFilesForTraining, 'messages' | 'userPrompt' | 'requestType'>): Promise<string[]>;
declare function getRelevantFiles(params: {
    messages: Message[];
    system: string | Array<TextBlock>;
    userPrompt: string;
    requestType: string;
    agentStepId: string;
    clientSessionId: string;
    fingerprintId: string;
    userInputId: string;
    userId: string | undefined;
    repoId: string | undefined;
    modelId?: FinetunedVertexModel;
    logger: Logger;
} & ParamsExcluding<typeof promptFlashWithFallbacks, 'messages' | 'model' | 'useFinetunedModel'>): Promise<{
    files: string[];
    duration: number;
    requestType: string;
    response: string;
}>;
/**
 * Gets relevant files for training using Claude Sonnet.
 *
 * @throws {Error} When the request is aborted by user. Check with `isAbortError()`.
 */
declare function getRelevantFilesForTraining(params: {
    messages: Message[];
    system: string | Array<TextBlock>;
    userPrompt: string;
    requestType: string;
    agentStepId: string;
    clientSessionId: string;
    fingerprintId: string;
    userInputId: string;
    userId: string | undefined;
    repoId: string | undefined;
    promptAiSdk: PromptAiSdkFn;
    logger: Logger;
} & ParamsExcluding<PromptAiSdkFn, 'messages' | 'model' | 'chargeUser'>): Promise<{
    files: string[];
    duration: number;
    requestType: string;
    response: string;
}>;
export {};
//# sourceMappingURL=request-files-prompt.d.ts.map