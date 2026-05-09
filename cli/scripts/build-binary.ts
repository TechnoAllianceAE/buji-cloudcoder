#!/usr/bin/env tsx

import { spawnSync, type SpawnSyncOptions } from 'child_process'
import {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'fs'
import { writeFile } from 'fs/promises'
import { tmpdir } from 'os'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { build } from 'esbuild'

type TargetInfo = {
  platform: NodeJS.Platform
  arch: string
}

const VERBOSE = process.env.VERBOSE === 'true'
const OVERRIDE_TARGET = process.env.OVERRIDE_TARGET
const OVERRIDE_PLATFORM = process.env.OVERRIDE_PLATFORM as
  | NodeJS.Platform
  | undefined
const OVERRIDE_ARCH = process.env.OVERRIDE_ARCH ?? undefined

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const cliRoot = join(__dirname, '..')
const repoRoot = dirname(cliRoot)

function log(message: string) {
  if (VERBOSE) {
    console.log(message)
  }
}

function logAlways(message: string) {
  console.log(message)
}

function runCommand(
  command: string,
  args: string[],
  options: SpawnSyncOptions = {},
) {
  const result = spawnSync(command, args, {
    cwd: options.cwd,
    stdio: VERBOSE ? 'inherit' : 'pipe',
    env: options.env,
  })

  if (result.status !== 0) {
    const stderr = result.stderr?.toString() ?? ''
    throw new Error(
      `Command "${command} ${args.join(' ')}" failed with exit code ${
        result.status
      }${stderr ? `\n${stderr}` : ''}`,
    )
  }
}

function getTargetInfo(): TargetInfo {
  if (OVERRIDE_TARGET && OVERRIDE_PLATFORM && OVERRIDE_ARCH) {
    return {
      bunTarget: OVERRIDE_TARGET,
      platform: OVERRIDE_PLATFORM,
      arch: OVERRIDE_ARCH,
    }
  }

  const platform = process.platform
  const arch = process.arch

  const mappings: Record<string, TargetInfo> = {
    'linux-x64': { platform: 'linux', arch: 'x64' },
    'linux-arm64': {
      platform: 'linux',
      arch: 'arm64',
    },
    'darwin-x64': {
      platform: 'darwin',
      arch: 'x64',
    },
    'darwin-arm64': {
      platform: 'darwin',
      arch: 'arm64',
    },
    'win32-x64': {
      platform: 'win32',
      arch: 'x64',
    },
  }

  const key = `${platform}-${arch}`
  const target = mappings[key]

  if (!target) {
    throw new Error(`Unsupported build target: ${key}`)
  }

  return target
}

async function main() {
  const [, , binaryNameArg, version] = process.argv
  const binaryName = binaryNameArg ?? 'bcp'

  if (!version) {
    throw new Error('Version argument is required when building a binary')
  }

  log(`Building ${binaryName} @ ${version}`)

  const targetInfo = getTargetInfo()
  const binDir = join(cliRoot, 'bin')

  if (!existsSync(binDir)) {
    mkdirSync(binDir, { recursive: true })
  }

  // Generate bundled agents file before compiling
  log('Generating bundled agents...')
  runCommand('tsx', ['scripts/prebuild-agents.ts'], {
    cwd: cliRoot,
    env: process.env,
  })

  // Ensure SDK assets exist before compiling the CLI
  log('Building SDK dependencies...')
  runCommand('pnpm', ['--dir', '../sdk', 'run', 'build'], {
    cwd: cliRoot,
    env: process.env,
  })

  patchOpenTuiAssetPaths()
  await ensureOpenTuiNativeBundle(targetInfo)

  const outputFilename =
    targetInfo.platform === 'win32' ? `${binaryName}.exe` : binaryName
  const outputFile = join(binDir, outputFilename)

  // Collect all NEXT_PUBLIC_* environment variables
  const nextPublicEnvVars = Object.entries(process.env)
    .filter(([key]) => key.startsWith('NEXT_PUBLIC_'))
    .map(([key, value]) => [`process.env.${key}`, `"${value ?? ''}"`])

  // Get git commit hash for build info
  const gitHash = spawnSync('git', ['rev-parse', '--short', 'HEAD'], {
    encoding: 'utf-8',
    stdio: ['pipe', 'pipe', 'pipe'],
  })
  const commitHash = gitHash.stdout?.trim() || 'unknown'
  const buildTime = new Date().toISOString()

  // Absolute path to the template types dir, baked in so the binary doesn't
  // have to resolve it relative to import.meta.url (which changes between
  // source and bundle locations).
  const templatesDir = join(repoRoot, 'common', 'src', 'templates', 'initial-agents-dir', 'types')

  const defineFlags = [
    ['process.env.NODE_ENV', '"production"'],
    ['process.env.BCP_IS_BINARY', '"true"'],
    ['process.env.BCP_CLI_VERSION', `"${version}"`],
    ['process.env.BCP_BUILD_HASH', `"${commitHash}"`],
    ['process.env.BCP_BUILD_TIME', `"${buildTime}"`],
    [
      'process.env.BCP_CLI_TARGET',
      `"${targetInfo.platform}-${targetInfo.arch}"`,
    ],
    ['process.env.BCP_MODE', `"${process.env.BCP_MODE ?? 'false'}"`],
    ['process.env.BCP_TEMPLATES_DIR', `"${templatesDir}"`],
    ...nextPublicEnvVars,
  ]

  log(`esbuild src/index.tsx --bundle --outfile=${outputFile}`)

  await build({
    entryPoints: [join(cliRoot, 'src/index.tsx')],
    outfile: outputFile,
    bundle: true,
    platform: 'node',
    target: 'node20',
    format: 'esm',
    banner: {
      js: '#!/usr/bin/env node',
    },
    sourcemap: false,
    loader: {
      '.scm': 'text',
    },
    define: Object.fromEntries(defineFlags),
    external: [
      '@opentui/core',
      '@opentui/react',
      'react',
      'react-dom',
      'react-reconciler',
      'yoga-layout',
      'terminal-image',
      'jimp',
    ],
  })

  // Strip any leading shebang from the bundled source (e.g. "#!/usr/bin/env tsx")
  // that esbuild includes before our own banner, leaving only our "#!/usr/bin/env node".
  const bundleContent = readFileSync(outputFile, 'utf8')
  const cleaned = bundleContent.replace(/^#!\/usr\/bin\/env tsx\n/, '')
  if (cleaned !== bundleContent) {
    writeFileSync(outputFile, cleaned)
  }

  if (targetInfo.platform !== 'win32') {
    chmodSync(outputFile, 0o755)
  }

  // Copy tree-sitter WASM files next to the executable JS bundle.
  copyWasmFilesNextToBinary(binDir)

  logAlways(
    `✅ Built ${outputFilename} (${targetInfo.platform}-${targetInfo.arch})`,
  )
}

main().catch((error: unknown) => {
  if (error instanceof Error) {
    console.error(error.message)
  } else {
    console.error(error)
  }
  process.exit(1)
})

function copyWasmFilesNextToBinary(binDir: string) {
  const wasmDestDir = join(binDir, 'wasm')
  mkdirSync(wasmDestDir, { recursive: true })

  // Source: SDK copies WASM files to sdk/dist/wasm/ during its build step
  const sdkWasmDir = join(repoRoot, 'sdk', 'dist', 'wasm')
  // Fallback: node_modules (standard path)
  const nodeModulesWasmDir = join(
    repoRoot,
    'node_modules',
    '@vscode',
    'tree-sitter-wasm',
    'wasm',
  )
  const webTreeSitterDir = join(repoRoot, 'node_modules', 'web-tree-sitter')

  const wasmFiles = [
    'tree-sitter.wasm',
    'tree-sitter-c-sharp.wasm',
    'tree-sitter-cpp.wasm',
    'tree-sitter-go.wasm',
    'tree-sitter-java.wasm',
    'tree-sitter-javascript.wasm',
    'tree-sitter-python.wasm',
    'tree-sitter-ruby.wasm',
    'tree-sitter-rust.wasm',
    'tree-sitter-tsx.wasm',
    'tree-sitter-typescript.wasm',
  ]

  let copied = 0
  for (const file of wasmFiles) {
    const sdkPath = join(sdkWasmDir, file)
    const nmPath = join(nodeModulesWasmDir, file)
    const dest = join(wasmDestDir, file)

    const webTreeSitterPath = join(webTreeSitterDir, file)
    const sources = [sdkPath, nmPath, webTreeSitterPath]
    const found = sources.find((s) => existsSync(s))
    if (found) {
      writeFileSync(dest, readFileSync(found))
      copied++
    } else {
      logAlways(`  ⚠ Warning: WASM file not found: ${file}`)
    }
  }
  logAlways(`  ✓ Copied ${copied} WASM files to ${wasmDestDir}`)
}

function patchOpenTuiAssetPaths() {
  const coreDir = join(cliRoot, 'node_modules', '@opentui', 'core')
  if (!existsSync(coreDir)) {
    log('OpenTUI core package not found; skipping asset patch')
    return
  }

  const indexFile = readdirSync(coreDir).find(
    (file) => file.startsWith('index') && file.endsWith('.js'),
  )

  if (!indexFile) {
    log('OpenTUI core index bundle not found; skipping asset patch')
    return
  }

  const indexPath = join(coreDir, indexFile)
  const content = readFileSync(indexPath, 'utf8')

  const absolutePathPattern =
    /var __dirname = ".*?packages\/core\/src\/lib\/tree-sitter\/assets";/
  if (!absolutePathPattern.test(content)) {
    log('OpenTUI core bundle already has relative asset paths')
    return
  }

  const replacement =
    'var __dirname = path3.join(path3.dirname(fileURLToPath(new URL(".", import.meta.url))), "lib/tree-sitter/assets");'

  const patched = content.replace(absolutePathPattern, replacement)
  writeFileSync(indexPath, patched)
  logAlways('Patched OpenTUI core tree-sitter asset paths')
}

async function ensureOpenTuiNativeBundle(targetInfo: TargetInfo) {
  const packageName = `@opentui/core-${targetInfo.platform}-${targetInfo.arch}`
  const packageFolder = `core-${targetInfo.platform}-${targetInfo.arch}`
  const installTargets = [
    {
      label: 'workspace root',
      packagesDir: join(repoRoot, 'node_modules', '@opentui'),
      packageDir: join(repoRoot, 'node_modules', '@opentui', packageFolder),
    },
    {
      label: 'CLI workspace',
      packagesDir: join(cliRoot, 'node_modules', '@opentui'),
      packageDir: join(cliRoot, 'node_modules', '@opentui', packageFolder),
    },
  ]

  const missingTargets = installTargets.filter(
    ({ packageDir }) => !existsSync(packageDir),
  )
  if (missingTargets.length === 0) {
    log(
      `OpenTUI native bundle already present for ${targetInfo.platform}-${targetInfo.arch}`,
    )
    return
  }

  const corePackagePath =
    installTargets
      .map(({ packagesDir }) => join(packagesDir, 'core', 'package.json'))
      .find((candidate) => existsSync(candidate)) ?? null

  if (!corePackagePath) {
    log('OpenTUI core package metadata missing; skipping native bundle fetch')
    return
  }
  const corePackageJson = JSON.parse(readFileSync(corePackagePath, 'utf8')) as {
    optionalDependencies?: Record<string, string>
  }
  const version = corePackageJson.optionalDependencies?.[packageName]
  if (!version) {
    log(
      `No optional dependency declared for ${packageName}; skipping native bundle fetch`,
    )
    return
  }

  const registryBase =
    process.env.BCP_NPM_REGISTRY ??
    process.env.NPM_REGISTRY_URL ??
    'https://registry.npmjs.org'
  const metadataUrl = `${registryBase.replace(/\/$/, '')}/${encodeURIComponent(packageName)}`
  log(`Fetching OpenTUI native bundle metadata from ${metadataUrl}`)

  const metadataResponse = await fetch(metadataUrl)
  if (!metadataResponse.ok) {
    throw new Error(
      `Failed to fetch metadata for ${packageName}: ${metadataResponse.status} ${metadataResponse.statusText}`,
    )
  }

  const metadataResponseBody = await metadataResponse.json()
  const metadata = metadataResponseBody as {
    versions?: Record<
      string,
      {
        dist?: {
          tarball?: string
        }
      }
    >
  }
  const tarballUrl = metadata.versions?.[version]?.dist?.tarball
  if (!tarballUrl) {
    throw new Error(`Tarball URL missing for ${packageName}@${version}`)
  }

  log(`Downloading OpenTUI native bundle from ${tarballUrl}`)
  const tarballResponse = await fetch(tarballUrl)
  if (!tarballResponse.ok) {
    throw new Error(
      `Failed to download ${packageName}@${version}: ${tarballResponse.status} ${tarballResponse.statusText}`,
    )
  }

  const tempDir = mkdtempSync(join(tmpdir(), 'opentui-'))
  try {
    const tarballPath = join(
      tempDir,
      `${packageName.split('/').pop() ?? 'package'}-${version}.tgz`,
    )
    const tarballBuffer = Buffer.from(await tarballResponse.arrayBuffer())
    await writeFile(tarballPath, tarballBuffer)

    for (const target of missingTargets) {
      mkdirSync(target.packagesDir, { recursive: true })
      mkdirSync(target.packageDir, { recursive: true })

      if (!existsSync(target.packageDir)) {
        throw new Error(
          `Failed to create directory for ${packageName}: ${target.packageDir}`,
        )
      }

      const tarballForTar =
        process.platform === 'win32'
          ? tarballPath.replace(/\\/g, '/')
          : tarballPath
      const extractDirForTar =
        process.platform === 'win32'
          ? target.packageDir.replace(/\\/g, '/')
          : target.packageDir

      const tarArgs = [
        '-xzf',
        tarballForTar,
        '--strip-components=1',
        '-C',
        extractDirForTar,
      ]
      if (process.platform === 'win32') {
        tarArgs.unshift('--force-local')
      }

      runCommand('tar', tarArgs)
      log(
        `Installed OpenTUI native bundle for ${targetInfo.platform}-${targetInfo.arch} in ${target.label}`,
      )
    }
    logAlways(
      `Fetched OpenTUI native bundle for ${targetInfo.platform}-${targetInfo.arch}`,
    )
  } finally {
    rmSync(tempDir, { recursive: true, force: true })
  }
}
