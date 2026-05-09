import { BCPClient } from '@bcp/sdk'

import { getAuthTokenDetails } from '../utils/auth'
import { isSensitiveFile, isEnvTemplateFile } from '../utils/create-run-config'
import {
  AGENT_MODE_TO_COST_MODE,
  AGENT_MODE_TO_ID,
  type AgentMode,
} from '../utils/constants'
import { getCliEnv, getSystemProcessEnv } from '../utils/env'
import { loadAgentDefinitions } from '../utils/local-agent-registry'
import { logger as defaultLogger } from '../utils/logger'
import { extractSpawnAgentResultContent } from '../utils/message-block-helpers'
import { getRgPath } from '../native/ripgrep'
import { getProjectRoot } from '../project-files'
import { loadMostRecentChatState } from '../utils/run-state-storage'

import type { ClientToolCall } from '@bcp/common/tools/list'
import type { Logger } from '@bcp/common/types/contracts/logger'
import type { AgentDefinition, FileFilter, RunState } from '@bcp/sdk'

const noopLogger: Logger = {
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {},
}

function resolveCliAgent(
  agentMode: AgentMode,
  agentId: string | undefined,
  agentDefinitions: AgentDefinition[],
): AgentDefinition | string {
  const selectedAgentDefinition =
    agentId && agentDefinitions.length > 0
      ? agentDefinitions.find((definition) => definition.id === agentId)
      : undefined

  return selectedAgentDefinition ?? agentId ?? AGENT_MODE_TO_ID[agentMode]
}

export type RunPrintModeParams = {
  prompt: string
  agentId?: string
  initialMode: AgentMode
  quiet: boolean
  continueChat: boolean
  continueChatId?: string | null
}

/**
 * Single non-interactive agent run (Auggie-style `--print`): run one turn, print
 * the assistant result to stdout, exit. `ask_user` is auto-skipped so CI/headless
 * does not hang.
 */
export async function runPrintMode(params: RunPrintModeParams): Promise<number> {
  const {
    prompt,
    agentId,
    initialMode,
    quiet,
    continueChat,
    continueChatId,
  } = params

  const { token } = getAuthTokenDetails()
  if (!token) {
    process.stderr.write('Not authenticated. Run `bcp login` first.\n')
    return 1
  }

  const agentDefinitions = loadAgentDefinitions()
  const projectRoot = getProjectRoot()
  const env = getCliEnv()
  if (env.BCP_IS_BINARY) {
    try {
      getSystemProcessEnv().BCP_RG_PATH = await getRgPath()
    } catch {
      // best effort — SDK may still resolve ripgrep elsewhere
    }
  }

  const log = quiet ? noopLogger : defaultLogger

  let previousRun: RunState | undefined
  if (continueChat) {
    const saved = loadMostRecentChatState(continueChatId ?? undefined)
    if (saved?.runState) {
      previousRun = saved.runState
    }
  }

  const fileFilter: FileFilter = (filePath: string) => {
    if (isSensitiveFile(filePath)) return { status: 'blocked' }
    if (isEnvTemplateFile(filePath)) return { status: 'allow-example' }
    return { status: 'allow' }
  }

  const client = new BCPClient({
    apiKey: token,
    cwd: projectRoot,
    agentDefinitions,
    logger: log,
    fileFilter,
    handleEvent: (event) => {
      if (event.type === 'error') {
        throw new Error(event.message)
      }
    },
    overrideTools: {
      ask_user: async (_input: ClientToolCall<'ask_user'>['input']) => {
        return [{ type: 'json', value: { skipped: true } }]
      },
    },
  })

  const resolvedAgent = resolveCliAgent(initialMode, agentId, agentDefinitions)

  let runState: RunState
  try {
    runState = await client.run({
      agent: resolvedAgent,
      prompt,
      content: undefined,
      previousRun,
      costMode: AGENT_MODE_TO_COST_MODE[initialMode],
      maxAgentSteps: 100,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    process.stderr.write(`${message}\n`)
    return 1
  }

  if (runState.output.type === 'error') {
    process.stderr.write(`${runState.output.message}\n`)
    return 1
  }

  const { content } = extractSpawnAgentResultContent(runState.output)
  const out = content.trim().length > 0 ? content : ''
  process.stdout.write(out + (out === '' || out.endsWith('\n') ? '' : '\n'))
  return 0
}
