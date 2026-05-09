// Build script for @bcp/sdk using esbuild with dual package support.
// Creates ESM + CJS bundles with TypeScript declarations.

import { spawnSync } from 'child_process'
import { builtinModules } from 'module'
import { cp, mkdir, readFile, rm, writeFile } from 'fs/promises'

import { build as esbuild } from 'esbuild'

async function build() {
  console.log('Cleaning dist directory...')
  await rm('dist', { recursive: true, force: true })
  await mkdir('./dist', { recursive: true })

  const pkgText = await readFile('./package.json', 'utf8')
  const pkg = JSON.parse(pkgText)
  const external = [
    ...Object.keys(pkg.dependencies || {}).filter(
      (dep) => !dep.startsWith('@bcp/'),
    ),
    ...builtinModules,
    ...builtinModules.map((mod) => `node:${mod}`),
    'ws',
    'bufferutil',
    'utf-8-validate',
  ]

  const commonOptions = {
    entryPoints: ['src/index.ts'],
    bundle: true,
    platform: 'node' as const,
    target: 'node18',
    sourcemap: true,
    minify: false,
    external,
    loader: { '.scm': 'text' as const },
  }

  console.log('Building ESM format...')
  await esbuild({
    ...commonOptions,
    format: 'esm',
    outfile: 'dist/index.mjs',
  })

  console.log('Building CJS format...')
  await esbuild({
    ...commonOptions,
    format: 'cjs',
    outfile: 'dist/index.cjs',
    define: {
      'import.meta.url': 'undefined',
      'import.meta': 'undefined',
    },
  })

  console.log('Generating TypeScript declarations via tsc...')
  try {
    const tscResult = spawnSync('npx', ['tsc', '-p', 'tsconfig.build.json'], {
      cwd: new URL('..', import.meta.url),
      stdio: 'pipe',
      encoding: 'utf8',
    })
    const stderr = tscResult.stderr.trim()
    if (tscResult.status !== 0) {
      const { existsSync } = await import('fs')
      if (!existsSync('dist/index.d.ts')) {
        throw new Error(stderr || 'tsc exited with no output')
      }
      console.warn('  tsc reported warnings but produced declarations:')
      console.warn('   ', stderr.split('\n').slice(0, 5).join('\n    '))
    }
    await fixDuplicateImports()
    console.log('  Created type declarations')
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    console.warn('TypeScript declaration generation failed (non-fatal):', msg)
    console.warn('   Skipping .d.ts generation; JS bundles are still valid.')
  }

  console.log('Copying WASM files for tree-sitter...')
  await copyWasmFiles()

  console.log('Copying vendored ripgrep binaries...')
  await copyRipgrepVendor()

  console.log('Build complete!')
  console.log('  dist/index.mjs (ESM)')
  console.log('  dist/index.cjs (CJS)')
  console.log('  dist/index.d.ts (Types)')
}

async function fixDuplicateImports() {
  try {
    let content = await readFile('dist/index.d.ts', 'utf-8')
    const zodDefaultImportRegex = /import\s+z\s+from\s+['"]zod\/v4['"];?\n?/g
    const zodNamedImportRegex =
      /import\s+\{\s*z\s*\}\s+from\s+['"]zod\/v4['"];?/

    if (
      content.match(zodNamedImportRegex) &&
      content.match(zodDefaultImportRegex)
    ) {
      content = content.replace(zodDefaultImportRegex, '')
    }

    await writeFile('dist/index.d.ts', content)
    console.log('  Fixed duplicate imports in bundled types')
  } catch (error) {
    console.warn(
      '  Warning: Could not fix duplicate imports:',
      error instanceof Error ? error.message : String(error),
    )
  }
}

async function copyWasmFiles() {
  const wasmSourceDirs = ['../node_modules/@vscode/tree-sitter-wasm/wasm']
  const webTsFallbackDirs = ['../node_modules/web-tree-sitter']
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

  await mkdir('dist/wasm', { recursive: true })

  for (const wasmFile of wasmFiles) {
    let copied = false
    for (const dir of wasmSourceDirs) {
      try {
        await cp(`${dir}/${wasmFile}`, `dist/wasm/${wasmFile}`)
        copied = true
        break
      } catch {}
    }
    if (!copied && wasmFile === 'tree-sitter.wasm') {
      for (const dir of webTsFallbackDirs) {
        try {
          await cp(`${dir}/${wasmFile}`, `dist/wasm/${wasmFile}`)
          copied = true
          break
        } catch {}
      }
    }
    if (!copied) {
      console.warn(`  Warning: Could not find ${wasmFile} in any source directory`)
    }
  }
}

async function copyRipgrepVendor() {
  const vendorSrc = 'vendor/ripgrep'
  const vendorDest = 'dist/vendor/ripgrep'
  try {
    await mkdir(vendorDest, { recursive: true })
    await cp(vendorSrc, vendorDest, { recursive: true })
    console.log('  Copied vendored ripgrep binaries')
  } catch {
    console.warn('  No vendored ripgrep found; skipping (use fetch-ripgrep.ts first)')
  }
}

build().catch((error) => {
  console.error(error)
  process.exit(1)
})
