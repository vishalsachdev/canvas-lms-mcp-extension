import { CanvasConfig } from './config.js';
export interface CanvasAPIResponse<T = any> {
    data: T;
    status: number;
    headers: Record<string, string>;
}
export declare class CanvasAPIError extends Error {
    status?: number | undefined;
    response?: any | undefined;
    constructor(message: string, status?: number | undefined, response?: any | undefined);
}
export declare class CanvasClient {
    private config;
    constructor(config: CanvasConfig);
    private makeRequest;
    get<T = any>(endpoint: string, params?: Record<string, any>): Promise<CanvasAPIResponse<T>>;
    post<T = any>(endpoint: string, data?: any, params?: Record<string, any>): Promise<CanvasAPIResponse<T>>;
    put<T = any>(endpoint: string, data?: any, params?: Record<string, any>): Promise<CanvasAPIResponse<T>>;
    patch<T = any>(endpoint: string, data?: any, params?: Record<string, any>): Promise<CanvasAPIResponse<T>>;
    delete<T = any>(endpoint: string, params?: Record<string, any>): Promise<CanvasAPIResponse<T>>;
    getAllPages<T = any>(endpoint: string, params?: Record<string, any>): Promise<T[]>;
}
//# sourceMappingURL=canvas-client.d.ts.map