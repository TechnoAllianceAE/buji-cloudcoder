/**
 * Self-update for BujiCoderPlus CLI.
 * Downloads binaries from ent.bujicoder.com/download/ and verifies SHA256 checksums.
 */
import { createHash } from 'crypto'
import { createReadStream, createWriteStream } from 'fs'
import { chmod, mkdtemp, rename, rm, stat } from 'fs/promises'
import { tmpdir } from 'os'
import { join, basename } from 'path'
import { pipeline } from 'stream/promises'
import { execSync } from 'child_process'

const DOWNLOAD_BASE_URL = 'https://ent.bujicoder.com/download'
const CHECKSUMS_FILE = 'bcp_checksums.txt'

function getBinaryAssetName(): string {
  const platform = process.platform === 'win32' ? 'windows' : process.platform
  const arch = process.arch === 'x64' ? 'amd64' : process.arch
  const name = `bcp_${platform}_${arch}`
  return platform === 'windows' ? `${name}.exe` : name
}

async function fileChecksum(path: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = createHash('sha256')
    const stream = createReadStream(path)
    stream.on('data', (data) => hash.update(data))
    stream.on('end', () => resolve(hash.digest('hex')))
    stream.on('error', reject)
  })
}

async function fetchRemoteChecksum(asset: string): Promise<string | null> {
  try {
    const response = await fetch(`${DOWNLOAD_BASE_URL}/${CHECKSUMS_FILE}`, {
      signal: AbortSignal.timeout(10_000),
    })
    if (!response.ok) return null
    const body = await response.text()

    for (const line of body.split('\n')) {
      const trimmed = line.trim()
      if (trimmed.endsWith(asset) || trimmed.endsWith(`  ${asset}`)) {
        const parts = trimmed.split(/\s+/)
        if (parts.length >= 2) return parts[0]
      }
    }
    return null
  } catch {
    return null
  }
}

async function downloadFile(url: string, dest: string): Promise<void> {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(120_000),
  })
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }
  if (!response.body) {
    throw new Error('No response body')
  }
  const writer = createWriteStream(dest)
  // node-fetch returns a Node-compatible readable stream.
  await pipeline(response.body as any, writer)
}

export interface UpdateInfo {
  available: boolean
  asset: string
  url: string
}

export async function checkForUpdate(): Promise<UpdateInfo | null> {
  const version = process.env.BCP_CLI_VERSION
  if (!version || version === 'dev') return null
  if (process.env.BCP_DISABLE_UPDATE_CHECK === '1') return null

  const asset = getBinaryAssetName()
  const remoteChecksum = await fetchRemoteChecksum(asset)
  if (!remoteChecksum) return null

  try {
    const exe = process.execPath
    const localChecksum = await fileChecksum(exe)
    if (localChecksum === remoteChecksum) return null
  } catch {
    return null
  }

  return {
    available: true,
    asset,
    url: `${DOWNLOAD_BASE_URL}/${asset}`,
  }
}

export async function applyUpdate(): Promise<void> {
  const version = process.env.BCP_CLI_VERSION || 'unknown'
  if (version === 'dev') {
    console.error('Cannot update dev builds — install a release version first.')
    process.exit(1)
  }

  const asset = getBinaryAssetName()
  const url = `${DOWNLOAD_BASE_URL}/${asset}`

  console.log(`Checking for updates (current: v${version})...`)

  // Fetch expected checksum
  const expectedChecksum = await fetchRemoteChecksum(asset)
  if (!expectedChecksum) {
    console.error('Failed to fetch checksums from server.')
    process.exit(1)
  }

  // Check if already up to date
  const exe = process.execPath
  try {
    const localChecksum = await fileChecksum(exe)
    if (localChecksum === expectedChecksum) {
      console.log(`✓ Already up to date (v${version})`)
      return
    }
  } catch {
    // Continue with update
  }

  console.log(`Downloading from ${url}...`)

  // Download to temp file
  const tmpDir = await mkdtemp(join(tmpdir(), 'bcp-update-'))
  const tmpFile = join(tmpDir, basename(exe))

  try {
    await downloadFile(url, tmpFile)

    // Verify checksum
    const dlChecksum = await fileChecksum(tmpFile)
    if (dlChecksum !== expectedChecksum) {
      console.error(`Checksum mismatch: expected ${expectedChecksum}, got ${dlChecksum}`)
      process.exit(1)
    }

    // Make executable
    if (process.platform !== 'win32') {
      await chmod(tmpFile, 0o755)
    }

    // Try direct rename
    try {
      await rename(tmpFile, exe)
    } catch (err: any) {
      if (err.code === 'EACCES' || err.code === 'EPERM') {
        if (process.platform !== 'win32') {
          console.log('Permission denied — retrying with sudo...')
          execSync(`sudo cp "${tmpFile}" "${exe}" && sudo chmod 755 "${exe}"`, {
            stdio: 'inherit',
          })
        } else {
          throw err
        }
      } else {
        // Cross-device: copy then remove
        execSync(`cp "${tmpFile}" "${exe}"`, { stdio: 'inherit' })
      }
    }

    console.log(`\n✓ Updated bcp from v${version} — restart to use the new version.`)
  } finally {
    await rm(tmpDir, { recursive: true, force: true }).catch(() => {})
  }
}

export async function uninstall(): Promise<void> {
  const homedir = (await import('os')).homedir()
  const configDir = join(homedir, '.bcp')

  // Find and remove the binary
  const exe = process.execPath
  console.log('Uninstalling BujiCoderPlus...\n')

  // Remove binary
  try {
    await rm(exe, { force: true })
    console.log(`  ✓ Removed binary: ${exe}`)
  } catch (err: any) {
    if (err.code === 'EACCES' || err.code === 'EPERM') {
      if (process.platform !== 'win32') {
        console.log('  Permission denied — retrying with sudo...')
        execSync(`sudo rm -f "${exe}"`, { stdio: 'inherit' })
        console.log(`  ✓ Removed binary: ${exe}`)
      } else {
        console.error(`  ✗ Could not remove binary: ${err.message}`)
      }
    } else {
      console.error(`  ✗ Could not remove binary: ${err.message}`)
    }
  }

  // Also check common install locations
  const otherPaths = [
    join(homedir, '.local', 'bin', 'bcp'),
    '/usr/local/bin/bcp',
  ].filter((p) => p !== exe)

  for (const binPath of otherPaths) {
    try {
      await stat(binPath)
      try {
        await rm(binPath, { force: true })
        console.log(`  ✓ Removed binary: ${binPath}`)
      } catch {
        if (process.platform !== 'win32') {
          execSync(`sudo rm -f "${binPath}"`, { stdio: 'inherit' })
          console.log(`  ✓ Removed binary: ${binPath}`)
        }
      }
    } catch {
      // File doesn't exist, skip
    }
  }

  // Remove config directory
  try {
    await stat(configDir)
    await rm(configDir, { recursive: true, force: true })
    console.log(`  ✓ Removed config: ${configDir}`)
  } catch {
    // Config dir doesn't exist
  }

  console.log('\n✓ BujiCoderPlus has been uninstalled.')
}
