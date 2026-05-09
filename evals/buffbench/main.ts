import path from 'path'
import { fileURLToPath } from 'url'

import { runBuffBench } from './run-buffbench'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function main() {
  // Compare BCP agents against external CLI agents
  // Use 'external:claude' for Claude Code CLI
  // Use 'external:codex' for OpenAI Codex CLI
  await runBuffBench({
    evalDataPaths: [path.join(__dirname, 'eval-sample.json')],
    agents: ['base2-free'],
    taskConcurrency: 5,
  })

  process.exit(0)
}

main().catch((error) => {
  console.error('Error running example:', error)
  process.exit(1)
})
