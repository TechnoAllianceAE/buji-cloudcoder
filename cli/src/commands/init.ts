import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

import { AnalyticsEvent } from '@bcp/common/constants/analytics-events'
import { PRIMARY_KNOWLEDGE_FILE_NAME } from '@bcp/common/constants/knowledge'

import { getProjectRoot } from '../project-files'
import { trackEvent } from '../utils/analytics'
import { IS_BCP } from '../utils/constants'
import { getSystemMessage } from '../utils/message-history'

import type { PostUserMessageFn } from '../types/contracts/send-message'

const brandName = IS_BCP ? 'BujiCoderPlus' : 'BujiCoderPlus'
// BCP_TEMPLATES_DIR is injected as an absolute path at binary build time (see build-binary.ts).
// In dev mode the env var is undefined and we fall back to the source-relative URL.
const templateTypesDir =
  process.env.BCP_TEMPLATES_DIR ??
  fileURLToPath(
    new URL('../../../common/src/templates/initial-agents-dir/types/', import.meta.url),
  )

const INITIAL_KNOWLEDGE_FILE = `# Project knowledge

This file gives ${brandName} context about your project: goals, commands, conventions, and gotchas.

## Quickstart
- Setup:
- Dev:
- Test:

## Architecture
- Key directories:
- Data flow:

## Conventions
- Formatting/linting:
- Patterns to follow:
- Things to avoid:
`

const COMMON_TYPE_FILES = [
  {
    fileName: 'agent-definition.ts',
    source: readFileSync(path.join(templateTypesDir, 'agent-definition.ts'), 'utf8'),
  },
  {
    fileName: 'tools.ts',
    source: readFileSync(path.join(templateTypesDir, 'tools.ts'), 'utf8'),
  },
  {
    fileName: 'util-types.ts',
    source: readFileSync(path.join(templateTypesDir, 'util-types.ts'), 'utf8'),
  },
]

export function handleInitializationFlowLocally(): {
  postUserMessage: PostUserMessageFn
} {
  const projectRoot = getProjectRoot()
  const knowledgePath = path.join(projectRoot, PRIMARY_KNOWLEDGE_FILE_NAME)
  const messages: string[] = []

  if (existsSync(knowledgePath)) {
    messages.push(`📋 \`${PRIMARY_KNOWLEDGE_FILE_NAME}\` already exists.`)
  } else {
    writeFileSync(knowledgePath, INITIAL_KNOWLEDGE_FILE)
    messages.push(`✅ Created \`${PRIMARY_KNOWLEDGE_FILE_NAME}\``)

    // Track knowledge file creation
    trackEvent(AnalyticsEvent.KNOWLEDGE_FILE_UPDATED, {
      action: 'created',
      fileName: PRIMARY_KNOWLEDGE_FILE_NAME,
      fileSizeBytes: Buffer.byteLength(INITIAL_KNOWLEDGE_FILE, 'utf8'),
    })
  }

  const agentsDir = path.join(projectRoot, '.agents')
  const agentsTypesDir = path.join(agentsDir, 'types')

  if (existsSync(agentsDir)) {
    messages.push('📋 `.agents/` already exists.')
  } else {
    mkdirSync(agentsDir, { recursive: true })
    messages.push('✅ Created `.agents/`')
  }

  if (existsSync(agentsTypesDir)) {
    messages.push('📋 `.agents/types/` already exists.')
  } else {
    mkdirSync(agentsTypesDir, { recursive: true })
    messages.push('✅ Created `.agents/types/`')
  }

  for (const { fileName, source } of COMMON_TYPE_FILES) {
    const targetPath = path.join(agentsTypesDir, fileName)
    if (existsSync(targetPath)) {
      messages.push(`📋 \`.agents/types/${fileName}\` already exists.`)
      continue
    }

    try {
      if (!source || source.trim().length === 0) {
        throw new Error('Source content is empty')
      }
      writeFileSync(targetPath, source)
      messages.push(`✅ Copied \`.agents/types/${fileName}\``)
    } catch (error) {
      messages.push(
        `⚠️ Failed to copy \`.agents/types/${fileName}\`: ${
          error instanceof Error ? error.message : String(error ?? 'Unknown')
        }`,
      )
    }
  }

  const postUserMessage: PostUserMessageFn = (prev) => [
    ...prev,
    ...messages.map((message) => getSystemMessage(message)),
  ]
  return { postUserMessage }
}
