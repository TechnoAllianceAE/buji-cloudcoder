import type { ChildProcess, SpawnOptions } from 'child_process';
/**
 * Spawn function for running shell commands.
 *
 * Compatible with `child_process.spawn` from Node.js.
 * Returns ChildProcess to support full streaming capabilities (stdin, stdout, stderr).
 */
export type BCPSpawn = (command: string, args?: readonly string[], options?: SpawnOptions) => ChildProcess;
/** @deprecated Use BCPSpawn instead */
export type CodebuffSpawn = BCPSpawn;
//# sourceMappingURL=spawn.d.ts.map