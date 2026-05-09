import path from 'path'
import { spawnSync } from 'child_process'
import { access, copyFile } from 'fs/promises'
import { constants } from 'fs'

import { getBundledRgPath } from '@bcp/sdk'

import { getCliEnv } from '../utils/env'
import { logger } from '../utils/logger'

const getRipgrepPath = async (): Promise<string> => {
  const env = getCliEnv()
  // In dev mode, use the SDK's bundled ripgrep binary
  if (!env.BCP_IS_BINARY) {
    return getBundledRgPath()
  }

  // Compiled mode - self-extract the embedded binary to the same directory as the current binary
  const binaryDir = path.dirname(process.execPath)
  const rgFileName = process.platform === 'win32' ? 'rg.exe' : 'rg'
  const outPath = path.join(binaryDir, rgFileName)

  // Check if already extracted
  try {
    await access(outPath, constants.X_OK)
    return outPath
  } catch {
    // Extract below.
  }

  // Extract the embedded binary
  try {
    // Use require() with literal paths to ensure the binary gets bundled into the compiled CLI
    // This is necessary for binary packaging to include the ripgrep binary
    let embeddedRgPath: string
    
    if (process.platform === 'darwin' && process.arch === 'arm64') {
      embeddedRgPath = require('../../../sdk/dist/vendor/ripgrep/arm64-darwin/rg')
    } else if (process.platform === 'darwin' && process.arch === 'x64') {
      embeddedRgPath = require('../../../sdk/dist/vendor/ripgrep/x64-darwin/rg')
    } else if (process.platform === 'linux' && process.arch === 'arm64') {
      embeddedRgPath = require('../../../sdk/dist/vendor/ripgrep/arm64-linux/rg')
    } else if (process.platform === 'linux' && process.arch === 'x64') {
      embeddedRgPath = require('../../../sdk/dist/vendor/ripgrep/x64-linux/rg')
    } else if (process.platform === 'win32' && process.arch === 'x64') {
      embeddedRgPath = require('../../../sdk/dist/vendor/ripgrep/x64-win32/rg.exe')
    } else {
      throw new Error(`Unsupported platform: ${process.platform}-${process.arch}`)
    }

    // Copy SDK's bundled binary to binary directory for portability
    await copyFile(embeddedRgPath, outPath)

    // Make executable on Unix systems
    if (process.platform !== 'win32') {
      spawnSync('chmod', ['+x', outPath])
    }

    return outPath
  } catch (error) {
    logger.error({ error }, 'Failed to extract ripgrep binary')
    // Fallback to SDK's bundled ripgrep if extraction fails
    return getBundledRgPath()
  }
}

// Cache the promise to avoid multiple extractions
let rgPathPromise: Promise<string> | null = null

export const getRgPath = (): Promise<string> => {
  if (!rgPathPromise) {
    rgPathPromise = getRipgrepPath()
  }
  return rgPathPromise
}

/**
 * Reset the cached ripgrep path promise.
 * Used primarily for testing to force re-extraction.
 */
export const resetRgPathCache = (): void => {
  rgPathPromise = null
}
