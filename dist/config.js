"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigHandler = exports.CanvasConfigSchema = void 0;
const zod_1 = require("zod");
exports.CanvasConfigSchema = zod_1.z.object({
    apiUrl: zod_1.z.string().url('Canvas API URL must be a valid URL'),
    apiToken: zod_1.z.string().min(1, 'Canvas API token is required'),
    apiTimeout: zod_1.z.number().positive().default(30),
    enableAnonymization: zod_1.z.boolean().default(true),
    maxRetries: zod_1.z.number().int().positive().default(3),
    retryDelay: zod_1.z.number().positive().default(1000),
});
class ConfigHandler {
    config = null;
    loadConfig() {
        try {
            // Parse command line arguments
            const args = process.argv;
            console.error('Command line arguments:', args);
            let apiUrl = '';
            let apiToken = '';
            let enableAnonymization = true;
            // Parse --flag value pairs
            for (let i = 0; i < args.length; i++) {
                if (args[i] === '--canvas-api-url' && i + 1 < args.length) {
                    apiUrl = args[i + 1];
                }
                else if (args[i] === '--canvas-api-token' && i + 1 < args.length) {
                    apiToken = args[i + 1];
                }
                else if (args[i] === '--ferpa-compliance' && i + 1 < args.length) {
                    enableAnonymization = args[i + 1] !== 'false';
                }
            }
            console.error('Parsed config:', {
                apiUrl: apiUrl ? apiUrl.substring(0, 20) + '...' : '[NOT SET]',
                apiToken: apiToken ? apiToken.substring(0, 20) + '...' : '[NOT SET]',
                enableAnonymization,
            });
            const rawConfig = {
                apiUrl,
                apiToken,
                apiTimeout: 30,
                enableAnonymization,
                maxRetries: 3,
                retryDelay: 1000,
            };
            this.config = exports.CanvasConfigSchema.parse(rawConfig);
            return this.config;
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                const errorMessages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
                throw new Error(`Configuration validation failed:\n${errorMessages.join('\n')}`);
            }
            throw error;
        }
    }
    validateConfig() {
        return this.config !== null;
    }
    getSecurityRecommendations() {
        const recommendations = [];
        if (!this.config?.enableAnonymization) {
            recommendations.push('FERPA compliance is disabled. Enable anonymization for student data protection.');
        }
        if (this.config?.apiTimeout && this.config.apiTimeout > 60) {
            recommendations.push('API timeout is very high. Consider reducing for better responsiveness.');
        }
        if (!process.env.CANVAS_API_TOKEN?.startsWith('1~')) {
            recommendations.push('API token format may be incorrect. Canvas tokens typically start with "1~"');
        }
        return recommendations;
    }
    getConfig() {
        if (!this.config) {
            throw new Error('Configuration not loaded. Call loadConfig() first.');
        }
        return this.config;
    }
}
exports.ConfigHandler = ConfigHandler;
//# sourceMappingURL=config.js.map