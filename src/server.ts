#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
  CallToolResult,
  TextContent,
} from '@modelcontextprotocol/sdk/types.js';
import { ConfigHandler, CanvasConfig } from './config.js';
import { CanvasClient, CanvasAPIError } from './canvas-client.js';
import { StudentDataAnonymizer } from './anonymizer.js';
import { CanvasTools } from './tools/canvas-tools.js';

export class CanvasMCPServer {
  private config: CanvasConfig | null = null;
  private client: CanvasClient | null = null;
  private anonymizer: StudentDataAnonymizer | null = null;
  private tools: CanvasTools | null = null;
  private configHandler = new ConfigHandler();

  constructor() {
    this.setupErrorHandlers();
  }

  private setupErrorHandlers(): void {
    process.on('uncaughtException', (error) => {
      console.error('Uncaught exception:', error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });
  }

  async initialize(): Promise<void> {
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
      this.client = new CanvasClient(this.config);
      
      // Initialize anonymizer
      this.anonymizer = new StudentDataAnonymizer(this.config.enableAnonymization);
      
      // Initialize tools
      this.tools = new CanvasTools(this.client, this.anonymizer);

      // Test Canvas connection
      await this.client.get('/users/self');
      
      console.error('Canvas MCP Server initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Canvas MCP Server:', error);
      throw error;
    }
  }

  getAvailableTools(): Tool[] {
    if (!this.tools) {
      throw new Error('Server not initialized');
    }
    return this.tools.getAllTools();
  }

  async callTool(name: string, arguments_: Record<string, any>): Promise<CallToolResult> {
    try {
      if (!this.tools) {
        throw new Error('Server not initialized');
      }

      // Log to stderr for debugging
      console.error(`Calling tool: ${name} with arguments:`, JSON.stringify(arguments_, null, 2));
      return await this.tools.callTool(name, arguments_);
    } catch (error) {
      console.error(`Error calling tool ${name}:`, error);
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${error instanceof Error ? error.message : String(error)}`,
          } as TextContent,
        ],
        isError: true,
      };
    }
  }
}

async function main(): Promise<void> {
  const canvasServer = new CanvasMCPServer();
  
  // Create MCP server
  const server = new Server(
    {
      name: 'canvas-mcp-server',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Handle list tools
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: canvasServer.getAvailableTools(),
    };
  });

  // Handle call tool
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    return await canvasServer.callTool(
      request.params.name,
      request.params.arguments || {}
    );
  });

  // Initialize the Canvas server
  await canvasServer.initialize();

  // Run the server
  const transport = new StdioServerTransport();
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