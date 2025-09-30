# MCP (Model Context Protocol) Setup

This project has four MCP servers configured:

## 1. Custom Strategic Plan Builder MCP Server
- **Location**: `mcp-server.ts` / `mcp-server.js`
- **Purpose**: Custom tools specific to this application
- **Available Tools**:
  - `get_district_goals`: Get all goals for a district
  - `create_goal`: Create a new goal for a district

### Build and Run Custom Server
```bash
# Build the TypeScript server
npm run mcp:build

# Start the server
npm run mcp:start
```

## 2. Supabase MCP Server
- **Package**: `@supabase/mcp-server-supabase`
- **Purpose**: Direct Supabase database interaction
- **Configuration**: Read-only mode for safety
- **Project Reference**: `qsftokjevxueboldvmzc`

### Features
The Supabase MCP server provides:
- Direct database queries
- Table management (in non-read-only mode)
- Configuration fetching
- Edge function deployment

## 3. GitHub MCP Server
- **Package**: `github-mcp-server` (via npx)
- **Purpose**: GitHub repository and code management
- **Features**:
  - Repository browsing and code search
  - Issue and PR management
  - CI/CD workflow monitoring
  - Code analysis and security insights
  - Commit history analysis

### GitHub MCP Capabilities
- Browse and query code across repositories
- Create, update, and manage issues/PRs
- Monitor GitHub Actions workflows
- Analyze security findings and Dependabot alerts
- Search code, issues, and discussions

## 4. Playwright MCP Server
- **Package**: `@playwright/mcp` (Microsoft)
- **Purpose**: Browser automation and web testing
- **Features**:
  - Automated browser control (Chromium, Firefox, WebKit)
  - Web page navigation and interaction
  - Screenshot and PDF generation
  - Form filling and button clicking
  - Web scraping and content extraction
  - Accessibility tree navigation

### Playwright MCP Capabilities
- Launch and control multiple browser types
- Navigate to URLs and interact with page elements
- Take screenshots and generate PDFs
- Fill forms and click buttons automatically
- Extract text and data from web pages
- Test web applications end-to-end
- Handle authentication and cookies
- Work with multiple browser tabs

## Configuration File
The `mcp.json` file configures all four servers for use with Claude or other MCP-compatible AI assistants.

## Security Notes
- The Supabase server is configured in **read-only mode** by default
- Service role key is required for authentication
- Project is scoped to specific Supabase project

## Environment Variables Required
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Public anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key for MCP server
- `GITHUB_TOKEN`: GitHub personal access token (for GitHub MCP server)

## Testing the Servers
To test if the MCP servers are working:
1. Ensure environment variables are set
2. Run `npm run mcp:build` to compile the custom server
3. The servers will be available to MCP-compatible clients