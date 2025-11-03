import { z } from 'zod';

// media.validation.ts
export const deleteFileSchema = z.object({
    params: z.object({
        filename: z.string().min(1, 'Filename is required')
    }),
    query: z.object({
        isPrivate: z
            .string()
            .optional()
            .refine((val) => val === 'true' || val === 'false', {
                message: 'isPrivate must be "true" or "false"'
            })
    })
});
