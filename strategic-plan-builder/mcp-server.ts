import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// Create server instance
const server = new Server(
  {
    name: 'strategic-plan-builder-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define available tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'get_district_goals',
      description: 'Get all goals for a district',
      inputSchema: {
        type: 'object',
        properties: {
          districtSlug: {
            type: 'string',
            description: 'The district slug identifier',
          },
        },
        required: ['districtSlug'],
      },
    },
    {
      name: 'create_goal',
      description: 'Create a new goal for a district',
      inputSchema: {
        type: 'object',
        properties: {
          districtSlug: {
            type: 'string',
            description: 'The district slug identifier',
          },
          title: {
            type: 'string',
            description: 'Goal title',
          },
          description: {
            type: 'string',
            description: 'Goal description',
          },
          parentId: {
            type: 'string',
            description: 'Parent goal ID (optional)',
          },
        },
        required: ['districtSlug', 'title'],
      },
    },
  ],
}));

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'get_district_goals': {
      const { districtSlug } = args as { districtSlug: string };
      // TODO: Implement actual database call
      return {
        content: [
          {
            type: 'text',
            text: `Getting goals for district: ${districtSlug}`,
          },
        ],
      };
    }

    case 'create_goal': {
      const { districtSlug, title, description, parentId } = args as {
        districtSlug: string;
        title: string;
        description?: string;
        parentId?: string;
      };
      // TODO: Implement actual database call
      return {
        content: [
          {
            type: 'text',
            text: `Creating goal "${title}" for district: ${districtSlug}`,
          },
        ],
      };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});