#!/usr/bin/env tsx

import fs from 'fs'
import { createRequire } from 'module'
import os from 'os'
import path from 'path'

import { AnalyticsEvent } from '@bcp/common/constants/analytics-events'
import { getProjectFileTree } from '@bcp/common/project-file-tree'
import { createCliRenderer } from '@opentui/core'
import { createRoot } from '@opentui/react'
import {
  QueryClient,
  QueryClientProvider,
  focusManager,
} from '@tanstack/react-query'
import { Command } from 'commander'
import { cyan, green, red, yellow } from 'picocolors'
import React from 'react'

import { App } from './app'
import { handlePublish } from './commands/publish'
import { runPrintMode } from './commands/run-print'
import { runPlainLogin } from './login/plain-login'
import { initializeApp } from './init/init-app'
import { getProjectRoot, setProjectRoot } from './project-files'
import { initAnalytics, trackEvent } from './utils/analytics'
import { getAuthToken, getAuthTokenDetails } from './utils/auth'
import { resetBCPClient } from './utils/bcp-client'
import { setApiClientAuthToken } from './utils/bcp-api'
import { IS_BCP } from './utils/constants'
import { getCliEnv } from './utils/env'
import { initializeAgentRegistry } from './utils/local-agent-registry'
import { clearLogFile, logger } from './utils/logger'
import { shouldShowProjectPicker } from './utils/project-picker'
import { saveRecentProject } from './utils/recent-projects'
import { installProcessCleanupHandlers } from './utils/renderer-cleanup'
import { initializeSkillRegistry } from './utils/skill-registry'
import { detectTerminalTheme } from './utils/terminal-color-detection'
import { setOscDetectedTheme } from './utils/theme-system'

import type { AgentMode } from './utils/constants'
import type { FileTreeNode } from '@bcp/common/util/file'

const require = createRequire(import.meta.url)

function loadPackageVersion(): string {
  const env = getCliEnv()
  const version = env.BCP_CLI_VERSION || (() => {
    try {
      const pkg = require('../package.json') as { version?: string }
      return pkg.version || 'dev'
    } catch {
      return 'dev'
    }
  })()

  const hash = process.env.BCP_BUILD_HASH || 'dev'
  const buildTime = process.env.BCP_BUILD_TIME || 'unknown'
  return `${version} (${hash}) built ${buildTime}`
}

// Configure TanStack Query's focusManager for terminal environments
// This is required because there's no browser visibility API in terminal apps
// Without this, refetchInterval won't work because TanStack Query thinks the app is "unfocused"
focusManager.setEventListener(() => {
  // No-op: no event listeners in CLI environment (no window focus/visibility events)
  return () => {}
})
focusManager.setFocused(true)

function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes - auth tokens don't change frequently
        gcTime: 10 * 60 * 1000, // 10 minutes - keep cached data a bit longer
        retry: false, // Don't retry failed auth queries automatically
        refetchOnWindowFocus: false, // CLI doesn't have window focus
        refetchOnReconnect: true, // Refetch when network reconnects
        refetchOnMount: false, // Don't refetch on every mount
      },
      mutations: {
        retry: 1, // Retry mutations once on failure
      },
    },
  })
}

type ParsedArgs = {
  initialPrompt: string | null
  agent?: string
  clearLogs: boolean
  continue: boolean
  continueId?: string | null
  cwd?: string
  initialMode?: AgentMode
  print: boolean
  quiet: boolean
}

function parseArgs(): ParsedArgs {
  const program = new Command()

  if (IS_BCP) {
    // BCP: interactive TUI by default; optional --print for one-shot stdout runs
    program
      .name('bcp')
      .description('BujiCoderPlus - AI coding assistant')
      .version(loadPackageVersion(), '-v, --version', 'Print the CLI version')
      .option(
        '--print',
        'Run one non-interactive turn, print the assistant reply to stdout, then exit',
      )
      .option(
        '--quiet',
        'With --print only: suppress internal log output on stderr',
      )
      .option(
        '--continue [conversation-id]',
        'Continue from a previous conversation (optionally specify a conversation id)',
      )
      .option(
        '--cwd <directory>',
        'Set the working directory (default: current directory)',
      )
      .option(
        '--agent <agent-id>',
        'With --print: run a specific agent id (skips loading local .agents overrides)',
      )
      .option('--heavy', 'With --print: use HEAVY cost mode')
      .option('--max', 'With --print: use MAX cost mode')
      .option('--plan', 'With --print: use PLAN agent mode')
      .helpOption('-h, --help', 'Show this help message')
      .argument('[prompt...]', 'Only used with --print: instruction for the agent')
      .allowExcessArguments(true)
      .parse(process.argv)
  } else {
    // Full CLI with all options
    program
      .name('bcp')
      .description('BujiCoderPlus CLI - AI-powered coding assistant')
      .version(loadPackageVersion(), '-v, --version', 'Print the CLI version')
      .option(
        '--agent <agent-id>',
        'Run a specific agent id (skips loading local .agents overrides)',
      )
      .option('--clear-logs', 'Remove any existing CLI log files before starting')
      .option(
        '--continue [conversation-id]',
        'Continue from a previous conversation (optionally specify a conversation id)',
      )
      .option(
        '--cwd <directory>',
        'Set the working directory (default: current directory)',
      )
      .option('--heavy', 'Start in HEAVY mode')
      .option('--max', 'Start in MAX mode')
      .option('--plan', 'Start in PLAN mode')
      .option(
        '--print',
        'Run one non-interactive turn, print the assistant reply to stdout, then exit',
      )
      .option(
        '--quiet',
        'With --print only: suppress internal log output on stderr',
      )
      .helpOption('-h, --help', 'Show this help message')
      .argument('[prompt...]', 'Initial prompt to send to the agent')
      .allowExcessArguments(true)
      .parse(process.argv)
  }

  const options = program.opts()
  const args = program.args

  const continueFlag = options.continue

  // Determine initial mode from flags (last flag wins if multiple specified)
  // Determine initial mode from flags (last flag wins)
  let initialMode: AgentMode | undefined
  if (options.heavy) initialMode = 'HEAVY'
  if (options.max) initialMode = 'MAX'
  if (options.plan) initialMode = 'PLAN'

  const print = Boolean(options.print)
  const quiet = Boolean(options.quiet)

  return {
    initialPrompt: args.length > 0 ? args.join(' ') : null,
    agent: options.agent,
    clearLogs: options.clearLogs || false,
    continue: Boolean(continueFlag),
    continueId:
      typeof continueFlag === 'string' && continueFlag.trim().length > 0
        ? continueFlag.trim()
        : null,
    cwd: options.cwd,
    initialMode,
    print,
    quiet,
  }
}

async function main(): Promise<void> {
  const parsed = parseArgs()

  // Run OSC theme detection before OpenTUI. Skip for --print so stdin stays clean for piping.
  if (
    process.stdin.isTTY &&
    process.platform !== 'win32' &&
    !parsed.print
  ) {
    try {
      const oscTheme = await detectTerminalTheme()
      if (oscTheme) {
        setOscDetectedTheme(oscTheme)
      }
    } catch {
      // Silently ignore OSC detection failures
    }
  }

  const {
    initialPrompt,
    agent,
    clearLogs,
    continue: continueChat,
    continueId,
    cwd,
    initialMode,
    print,
    quiet,
  } = parsed

  if (quiet && !print) {
    process.stderr.write('error: --quiet is only valid with --print\n')
    process.exit(1)
  }

  if (IS_BCP && !print && initialPrompt) {
    process.stderr.write(
      'error: unexpected prompt. Use --print for a one-shot command, or start the TUI without arguments.\n',
    )
    process.exit(1)
  }

  if (print && !initialPrompt?.trim()) {
    process.stderr.write(
      'error: --print requires a prompt, e.g. `bcp --print summarize ./README.md`\n',
    )
    process.exit(1)
  }

  const isUpdateCommand = process.argv[2] === 'update'
  const isUninstallCommand = process.argv[2] === 'uninstall'
  const isLoginCommand = process.argv[2] === 'login'
  const isPublishCommand = process.argv[2] === 'publish'
  const hasAgentOverride = Boolean(agent?.trim())

  await initializeApp({ cwd })

  // Set the auth token for the API client
  setApiClientAuthToken(getAuthToken())

  // Handle update command before rendering the app
  if (isUpdateCommand) {
    const { applyUpdate } = await import('./utils/self-update')
    await applyUpdate()
    return
  }

  // Handle uninstall command before rendering the app
  if (isUninstallCommand) {
    const { uninstall } = await import('./utils/self-update')
    await uninstall()
    return
  }

  // Handle login command before rendering the app
  if (isLoginCommand) {
    await runPlainLogin()
    return
  }

  if (print) {
    try {
      initAnalytics()
      trackEvent(AnalyticsEvent.APP_LAUNCHED, {
        version: loadPackageVersion(),
        platform: process.platform,
        arch: process.arch,
        hasInitialPrompt: true,
        hasAgentOverride: hasAgentOverride,
        continueChat,
        initialMode: initialMode ?? 'DEFAULT',
        isFreeBuff: IS_BCP,
        printMode: true,
      })
    } catch (error) {
      logger.debug(error, 'Failed to initialize analytics')
    }

    if (!hasAgentOverride) {
      await initializeAgentRegistry()
    }
    await initializeSkillRegistry()

    const code = await runPrintMode({
      prompt: initialPrompt!.trim(),
      agentId: agent,
      initialMode: initialMode ?? 'DEFAULT',
      quiet,
      continueChat,
      continueChatId: continueId,
    })
    process.exit(code)
  }

  // Show project picker only when user starts at the home directory or an ancestor
  const projectRoot = getProjectRoot()
  const homeDir = os.homedir()
  const startCwd = process.cwd()
  const showProjectPicker = shouldShowProjectPicker(startCwd, homeDir)

  // Initialize analytics early, before anything that might use the logger
  // (the logger calls trackEvent, which throws if analytics isn't initialized)
  try {
    initAnalytics()

    // Track app launch event
    trackEvent(AnalyticsEvent.APP_LAUNCHED, {
      version: loadPackageVersion(),
      platform: process.platform,
      arch: process.arch,
      hasInitialPrompt: Boolean(initialPrompt),
      hasAgentOverride: hasAgentOverride,
      continueChat,
      initialMode: initialMode ?? 'DEFAULT',
      isFreeBuff: IS_BCP,
      printMode: print,
    })
  } catch (error) {
    // Analytics initialization is optional - don't fail the app if it errors
    logger.debug(error, 'Failed to initialize analytics')
  }

  // Initialize agent registry (loads user agents via SDK).
  // When --agent is provided, skip local .agents to avoid overrides.
  if (isPublishCommand || !hasAgentOverride) {
    await initializeAgentRegistry()
  }

  // Initialize skill registry (loads skills from .agents/skills)
  await initializeSkillRegistry()

  // Handle publish command before rendering the app
  if (isPublishCommand) {
    const publishIndex = process.argv.indexOf('publish')
    const agentIds = process.argv.slice(publishIndex + 1)
    const result = await handlePublish(agentIds)

    if (result.success && result.publisherId && result.agents) {
      logger.info(green('✅ Successfully published:'))
      for (const agent of result.agents) {
        logger.info(
          cyan(
            `  - ${agent.displayName} (${result.publisherId}/${agent.id}@${agent.version})`,
          ),
        )
      }
      process.exit(0)
    } else {
      logger.error(red('❌ Publish failed'))
      if (result.error) logger.error(red(`Error: ${result.error}`))
      if (result.details) logger.error(red(result.details))
      if (result.hint) logger.warn(yellow(`Hint: ${result.hint}`))
      process.exit(1)
    }
  }

  if (clearLogs) {
    clearLogFile()
  }

  const queryClient = createQueryClient()

  const AppWithAsyncAuth = () => {
    const [requireAuth, setRequireAuth] = React.useState<boolean | null>(null)
    const [hasInvalidCredentials, setHasInvalidCredentials] =
      React.useState(false)
    const [fileTree, setFileTree] = React.useState<FileTreeNode[]>([])
    const [currentProjectRoot, setCurrentProjectRoot] =
      React.useState(projectRoot)
    const [showProjectPickerScreen, setShowProjectPickerScreen] =
      React.useState(showProjectPicker)

    React.useEffect(() => {
      const apiKey = getAuthTokenDetails().token ?? ''

      if (!apiKey) {
        setRequireAuth(true)
        setHasInvalidCredentials(false)
        return
      }

      setHasInvalidCredentials(true)
      setRequireAuth(false)
    }, [])

    const loadFileTree = React.useCallback(async (root: string) => {
      try {
        if (root) {
          const tree = await getProjectFileTree({
            projectRoot: root,
            fs: fs.promises,
          })
          setFileTree(tree)
        }
      } catch (error) {
        // Silently fail - fileTree is optional for @ menu
      }
    }, [])

    React.useEffect(() => {
      loadFileTree(currentProjectRoot)
    }, [currentProjectRoot, loadFileTree])

    // Callback for when user selects a new project from the picker
    const handleProjectChange = React.useCallback(
      async (newProjectPath: string) => {
        // Change process working directory
        process.chdir(newProjectPath)

        // Track directory change (avoid logging full paths for privacy)
        const isGitRepo = fs.existsSync(path.join(newProjectPath, '.git'))
        const pathDepth = newProjectPath.split(path.sep).filter(Boolean).length
        trackEvent(AnalyticsEvent.CHANGE_DIRECTORY, {
          isGitRepo,
          pathDepth,
          isHomeDir: newProjectPath === os.homedir(),
        })
        // Update the project root in the module state
        setProjectRoot(newProjectPath)
        // Reset client to ensure tools use the updated project root
        resetBCPClient()
        // Save to recent projects list
        saveRecentProject(newProjectPath)
        // Update local state
        setCurrentProjectRoot(newProjectPath)
        // Reset file tree state to trigger reload
        setFileTree([])
        // Hide the picker and show the chat
        setShowProjectPickerScreen(false)
      },
      [],
    )

    return (
      <App
        initialPrompt={initialPrompt}
        agentId={agent}
        requireAuth={requireAuth}
        hasInvalidCredentials={hasInvalidCredentials}
        fileTree={fileTree}
        continueChat={continueChat}
        continueChatId={continueId ?? undefined}
        initialMode={initialMode}
        showProjectPicker={showProjectPickerScreen}
        onProjectChange={handleProjectChange}
      />
    )
  }

  const renderer = await createCliRenderer({
    backgroundColor: 'transparent',
    exitOnCtrlC: false,
  })
  installProcessCleanupHandlers(renderer)
  createRoot(renderer).render(
    <QueryClientProvider client={queryClient}>
      <AppWithAsyncAuth />
    </QueryClientProvider>,
  )
}

void main()