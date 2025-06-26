#!/usr/bin/env node
import { Tool, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
export declare class CanvasMCPServer {
    private config;
    private client;
    private anonymizer;
    private tools;
    private configHandler;
    constructor();
    private setupErrorHandlers;
    initialize(): Promise<void>;
    getAvailableTools(): Tool[];
    callTool(name: string, arguments_: Record<string, any>): Promise<CallToolResult>;
}
//# sourceMappingURL=server.d.ts.map