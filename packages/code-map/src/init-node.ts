/** Whether tree-sitter initialized successfully. */
export let treeSitterAvailable = false

/**
 * Initialize web-tree-sitter for Node.js environments.
 *
 * In compiled Node bundles, web-tree-sitter's WASM loader calls abort()
 * which throws a synchronous RuntimeError that cannot be caught by
 * try-catch, Promise rejection, or process.on('uncaughtException').
 * This crashes the entire CLI process.
 *
 * Tree-sitter powers code-map (symbol scoring for context) — a
 * nice-to-have optimization, not a required feature. The CLI works
 * fine without it; files are still indexed by path and content.
 *
 * Tree-sitter is disabled in compiled binaries (BCP_IS_BINARY=true)
 * and enabled in development mode where WASM files are always available.
 */
export async function initTreeSitterForNode(): Promise<void> {
  if (process.env.BCP_IS_BINARY === 'true') {
    // Compiled binary — skip tree-sitter to avoid WASM abort crash
    treeSitterAvailable = false
    return
  }

  // Development mode — WASM files available via node_modules
  try {
    const { Parser } = await import('web-tree-sitter')
    await Parser.init()
    treeSitterAvailable = true
  } catch {
    treeSitterAvailable = false
  }
}
