import { jsonToolResult } from '@bcp/common/util/messages'

import { getFileReadingUpdates } from '../../../get-file-reading-updates'
import { renderReadFilesResult } from '../../../util/render-read-files-result'

import type { CodebuffToolHandlerFunction } from '../handler-function-type'
import type {
  CodebuffToolCall,
  CodebuffToolOutput,
} from '@bcp/common/tools/list'
import type { ParamsExcluding } from '@bcp/common/types/function-params'
import type { ProjectFileContext } from '@bcp/common/util/file'

type ToolName = 'read_files'
export const handleReadFiles = (async (
  params: {
    previousToolCallFinished: Promise<void>
    toolCall: CodebuffToolCall<ToolName>

    fileContext: ProjectFileContext
  } & ParamsExcluding<typeof getFileReadingUpdates, 'requestedFiles'>,
): Promise<{ output: CodebuffToolOutput<ToolName> }> => {
  const {
    previousToolCallFinished,
    toolCall,

    fileContext,
  } = params
  const { paths } = toolCall.input

  await previousToolCallFinished

  const addedFiles = await getFileReadingUpdates({
    ...params,
    requestedFiles: paths,
  })

  return {
    output: jsonToolResult(
      renderReadFilesResult(addedFiles, fileContext.tokenCallers ?? {}),
    ),
  }
}) satisfies CodebuffToolHandlerFunction<ToolName>
