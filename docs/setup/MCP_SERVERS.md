# MCP Servers Configuration

This document describes all MCP (Model Context Protocol) servers configured for this project.

## 🚀 Configured MCP Servers

### 1. Django CRM Server (`django-crm`)
- **Purpose**: Provides Django backend integration and database access
- **Command**: `python shared-backend/mcp_server.py`
- **Status**: ✅ Active
- **Features**:
  - Database queries
  - Model management
  - API endpoint testing
  - User management

### 2. Chakra UI Assistant (`chakra-ui-assistant`)
- **Purpose**: Provides Chakra UI component assistance and documentation
- **Command**: `npx -y @chakra-ui/mcp-server`
- **Status**: ✅ Active
- **Features**:
  - Component documentation
  - Styling guidance
  - Best practices
  - API reference

### 3. Edge DevTools (`edge-devtools`)
- **Purpose**: Browser debugging and inspection capabilities
- **Command**: `npx -y @syunnrai/edge-devtools-mcp`
- **Status**: ✅ Active (requires Edge in debug mode)
- **Features**:
  - DOM inspection
  - Network monitoring
  - Console access
  - Performance profiling

### 4. Chrome DevTools (`chrome-devtools`)
- **Purpose**: Chrome browser debugging and inspection
- **Command**: `npx -y chrome-devtools-mcp@latest`
- **Status**: ✅ Active (requires Chrome in debug mode)
- **Features**:
  - DOM inspection
  - Network monitoring
  - Console access
  - Performance profiling

### 5. Sequential Thinking (`sequential-thinking`) ⭐ NEW
- **Purpose**: Enhanced reasoning capabilities for complex problem-solving
- **Command**: `npx -y @modelcontextprotocol/server-sequential-thinking`
- **Status**: ✅ Active
- **Features**:
  - Step-by-step reasoning
  - Complex problem decomposition
  - Logical analysis
  - Solution planning
- **Configuration**: No additional configuration required
- **Usage**: Automatically available for complex reasoning tasks

## 📋 Configuration Files

### 1. `mcp-config.json`
Main MCP configuration file for Claude Desktop and other MCP clients.

### 2. `.vscode/mcp.json`
VS Code specific MCP server configuration.

## 🔧 Setup Instructions

### For Claude Desktop

1. Locate your Claude Desktop configuration file:
   - **Mac**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

2. Copy the configuration from `mcp-config.json` to your Claude Desktop config.

3. Restart Claude Desktop.

### For VS Code

The `.vscode/mcp.json` file is automatically used by VS Code MCP extension.

## ✅ Verification

To verify all MCP servers are working:

```bash
cd shared-backend
python scripts/verify_mcp_servers.py
```

## 🎯 Usage

### Sequential Thinking MCP

The Sequential Thinking MCP server enhances AI reasoning by:
- Breaking down complex problems into steps
- Analyzing problems logically
- Planning solutions systematically
- Providing structured reasoning

**Example Use Cases**:
- Complex code refactoring
- Architecture decisions
- Problem debugging
- System design
- Algorithm development

## 📝 Notes

- All MCP servers use `npx -y` for automatic installation
- Sequential Thinking server requires no additional setup
- DevTools servers require browsers to be started in debug mode
- Django CRM server requires Django environment to be set up

## 🔄 Updates

To update MCP servers:
1. They automatically update when using `npx -y`
2. Or manually update in configuration files
3. Restart your MCP client to apply changes

---

**Last Updated**: 2025-01-09
**Status**: All servers configured and ready to use

