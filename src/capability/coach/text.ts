import { z } from 'zod';

export const Text128 = z.string().trim().min(1).max(128);
