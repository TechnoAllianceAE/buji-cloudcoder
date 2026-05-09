import { mkdirSync, writeFileSync } from 'fs'
import path from 'path'

export async function extractAgentLessons(_params: unknown): Promise<{
  lessons: string[]
}> {
  return { lessons: [] }
}

export function saveAgentLessons(params: {
  agentId: string
  commitId: string
  commitSha: string
  prompt: string
  lessons: string[]
  lessonsDir: string
}): void {
  const { agentId, commitId, commitSha, prompt, lessons, lessonsDir } = params
  mkdirSync(lessonsDir, { recursive: true })
  writeFileSync(
    path.join(lessonsDir, `${commitId}-${agentId}.json`),
    JSON.stringify({ agentId, commitId, commitSha, prompt, lessons }, null, 2),
  )
}
