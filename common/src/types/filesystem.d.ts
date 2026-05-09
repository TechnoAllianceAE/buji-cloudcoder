import type fs from 'fs';
/** File system used for BCP SDK.
 *
 * Compatible with `fs.promises` from the `'fs'` module.
 */
export type BCPFileSystem = Pick<typeof fs.promises, 'mkdir' | 'readdir' | 'readFile' | 'stat' | 'unlink' | 'writeFile'>;
/** @deprecated Use BCPFileSystem instead */
export type CodebuffFileSystem = BCPFileSystem;
//# sourceMappingURL=filesystem.d.ts.map