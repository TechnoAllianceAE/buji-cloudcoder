import { z } from 'zod/v4';
/**
 * Zod schema for skill frontmatter metadata.
 */
export declare const SkillMetadataSchema: z.ZodRecord<z.ZodString, z.ZodString>;
/**
 * Zod schema for skill frontmatter (parsed from YAML).
 */
export declare const SkillFrontmatterSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodString;
    license: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
}, z.core.$strip>;
export type SkillFrontmatter = z.infer<typeof SkillFrontmatterSchema>;
/**
 * Full skill definition including content and source path.
 */
export declare const SkillDefinitionSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodString;
    license: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    content: z.ZodString;
    filePath: z.ZodString;
}, z.core.$strip>;
export type SkillDefinition = z.infer<typeof SkillDefinitionSchema>;
/**
 * Collection of skills keyed by skill name.
 */
export type SkillsMap = Record<string, SkillDefinition>;
//# sourceMappingURL=skill.d.ts.map