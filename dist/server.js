#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CanvasMCPServer = void 0;
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const config_js_1 = require("./config.js");
const canvas_client_js_1 = require("./canvas-client.js");
const anonymizer_js_1 = require("./anonymizer.js");
const canvas_tools_js_1 = require("./tools/canvas-tools.js");
class CanvasMCPServer {
    config = null;
    client = null;
    anonymizer = null;
    tools = null;
    configHandler = new config_js_1.ConfigHandler();
    constructor() {
        this.setupErrorHandlers();
    }
    setupErrorHandlers() {
        process.on('uncaughtException', (error) => {
            console.error('Uncaught exception:', error);
            process.exit(1);
        });
        process.on('unhandledRejection', (reason, promise) => {
            console.error('Unhandled rejection at:', promise, 'reason:', reason);
            process.exit(1);
        });
    }
    async initialize() {
        try {
            // Load configuration
            this.config = this.configHandler.loadConfig();
            // Log security recommendations
            const recommendations = this.configHandler.getSecurityRecommendations();
            recommendations.forEach(rec => {
                // Log to stderr to avoid interfering with JSON protocol
                console.error(`Security recommendation: ${rec}`);
            });
            // Initialize Canvas client
            this.client = new canvas_client_js_1.CanvasClient(this.config);
            // Initialize anonymizer
            this.anonymizer = new anonymizer_js_1.StudentDataAnonymizer(this.config.enableAnonymization);
            // Initialize tools
            this.tools = new canvas_tools_js_1.CanvasTools(this.client, this.anonymizer);
            // Test Canvas connection
            await this.client.get('/users/self');
            console.error('Canvas MCP Server initialized successfully');
        }
        catch (error) {
            console.error('Failed to initialize Canvas MCP Server:', error);
            throw error;
        }
    }
    getAvailableTools() {
        if (!this.tools) {
            throw new Error('Server not initialized');
        }
        return this.tools.getAllTools();
    }
    async callTool(name, arguments_) {
        try {
            if (!this.tools) {
                throw new Error('Server not initialized');
            }
            // Log to stderr for debugging
            console.error(`Calling tool: ${name} with arguments:`, JSON.stringify(arguments_, null, 2));
            return await this.tools.callTool(name, arguments_);
        }
        catch (error) {
            console.error(`Error calling tool ${name}:`, error);
            return {
                content: [
                    {
                        type: 'text',
                        text: `Error: ${error instanceof Error ? error.message : String(error)}`,
                    },
                ],
                isError: true,
            };
        }
    }
}
exports.CanvasMCPServer = CanvasMCPServer;
async function main() {
    const canvasServer = new CanvasMCPServer();
    // Create MCP server
    const server = new index_js_1.Server({
        name: 'canvas-mcp-server',
        version: '1.0.0',
    }, {
        capabilities: {
            tools: {},
        },
    });
    // Handle list tools
    server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => {
        return {
            tools: canvasServer.getAvailableTools(),
        };
    });
    // Handle call tool
    server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
        return await canvasServer.callTool(request.params.name, request.params.arguments || {});
    });
    // Initialize the Canvas server
    await canvasServer.initialize();
    // Run the server
    const transport = new stdio_js_1.StdioServerTransport();
    await server.connect(transport);
    // Server is now running and listening on stdio
}
// Run if this is the main module
if (require.main === module) {
    main().catch((error) => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}
//# sourceMappingURL=server.js.map