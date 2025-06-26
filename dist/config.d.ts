import { z } from 'zod';
export declare const CanvasConfigSchema: z.ZodObject<{
    apiUrl: z.ZodString;
    apiToken: z.ZodString;
    apiTimeout: z.ZodDefault<z.ZodNumber>;
    enableAnonymization: z.ZodDefault<z.ZodBoolean>;
    maxRetries: z.ZodDefault<z.ZodNumber>;
    retryDelay: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    apiUrl: string;
    apiToken: string;
    apiTimeout: number;
    enableAnonymization: boolean;
    maxRetries: number;
    retryDelay: number;
}, {
    apiUrl: string;
    apiToken: string;
    apiTimeout?: number | undefined;
    enableAnonymization?: boolean | undefined;
    maxRetries?: number | undefined;
    retryDelay?: number | undefined;
}>;
export type CanvasConfig = z.infer<typeof CanvasConfigSchema>;
export declare class ConfigHandler {
    private config;
    loadConfig(): CanvasConfig;
    validateConfig(): boolean;
    getSecurityRecommendations(): string[];
    getConfig(): CanvasConfig;
}
//# sourceMappingURL=config.d.ts.map