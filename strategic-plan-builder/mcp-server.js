"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
// Create server instance
const server = new index_js_1.Server({
    name: 'strategic-plan-builder-mcp',
    version: '1.0.0',
}, {
    capabilities: {
        tools: {},
    },
});
// Define available tools
server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => ({
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
server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    switch (name) {
        case 'get_district_goals': {
            const { districtSlug } = args;
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
            const { districtSlug, title, description, parentId } = args;
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
    const transport = new stdio_js_1.StdioServerTransport();
    await server.connect(transport);
    console.error('MCP Server running on stdio');
}
main().catch((error) => {
    console.error('Server error:', error);
    process.exit(1);
});
