# TigerGraph MCP Setup Guide for Cursor IDE

A complete step-by-step guide to connect TigerGraph's MCP server with Cursor IDE, enabling AI-powered graph database operations through natural language.

---

## What is TigerGraph MCP?

TigerGraph-MCP enables Cursor's AI agent to interact with your TigerGraph database using the **Model Context Protocol (MCP)**. Once set up, you can ask the AI to create schemas, add data, run queries, and manage your graph -- all through natural language in Cursor's chat.

**Repository**: https://github.com/TigerGraph-DevLabs/tigergraph-mcp

---

## Prerequisites

| Requirement | Details |
|-------------|---------|
| **Cursor IDE** | Latest version installed |
| **Python** | 3.10, 3.11, or 3.12 |
| **TigerGraph** | Version 4.1+ (Savanna Cloud, Docker, or local install) |
| **pip** | Python package manager |

---

## Step 1: Set Up a TigerGraph Instance

You need a running TigerGraph instance. Choose one option:

### Option A: TigerGraph Savanna (Cloud) -- Recommended

1. Go to https://savanna.tgcloud.io
2. Sign up / Log in
3. Click **"Create Cluster"**
4. Select **TigerGraph 4.2** (recommended for vector features)
5. Choose a region and instance size
6. Wait for the cluster to be **"Ready"**
7. Note down your **Host URL** from the cluster dashboard
   - It looks like: `https://tg-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.tg-xxxxxxxxxx.i.tgcloud.io`

### Option B: TigerGraph Docker (Local)

```bash
docker run -d -p 14240:14240 -p 9000:9000 -p 14241:14241 --name tigergraph tigergraph/tigergraph:4.2.0
```

### Option C: TigerGraph DB (On-Premise)

Follow the official installation guide: https://docs.tigergraph.com/

---

## Step 2: Generate a TigerGraph Secret

A secret is needed for authentication. This is different from username/password.

### For Savanna (Cloud):

1. Open your TigerGraph cluster dashboard
2. Go to **Admin Portal** (usually at `https://your-host:14240`)
3. Navigate to **Management** -> **Users**
4. Click on your user or create a new one
5. Under **Secret Management**, click **Generate Secret**
6. A secret string will appear (e.g., `c7e5v2rdqv3r6aguqduteiij90tjpfta`)
7. **Copy it immediately** -- you won't see it again

### For Docker / Local:

1. Open GraphStudio at `http://localhost:14240`
2. Go to **Admin Portal** -> **Management** -> **Users**
3. Generate a secret the same way

---

## Step 3: Install the TigerGraph MCP Python Package

Open a terminal and run:

```bash
pip install tigergraph-mcp
```

### Verify the installation:

```bash
python -c "import tigergraph_mcp; print('TigerGraph-MCP installed successfully!')"
```

Expected output:
```
TigerGraph-MCP installed successfully!
```

### Find your Python path (you'll need this later):

**Windows:**
```bash
where python
```
Output example: `C:\Users\YourName\AppData\Local\Programs\Python\Python312\python.exe`

**macOS / Linux:**
```bash
which python3
```
Output example: `/usr/bin/python3`

---

## Step 4: Create the MCP Wrapper Script

> **Why a wrapper script?** The TigerGraph MCP server has two known bugs that require a workaround:
> 1. On **Windows**, the OS sets a `USERNAME` environment variable that conflicts with `tigergraphx`'s config system
> 2. The CLI entry point can output non-JSON text that breaks Cursor's MCP client
>
> The wrapper script fixes both issues.

In your **project root folder**, create a file called `start_mcp.py`:

```python
import os
import sys
import asyncio
import logging

# Send all logging to stderr (not stdout) to avoid breaking MCP protocol
logging.basicConfig(level=logging.WARN, stream=sys.stderr)

# Workaround: Remove conflicting environment variables on Windows
# tigergraphx uses pydantic_settings which picks up the Windows USERNAME
# env var and treats it as a TigerGraph username, conflicting with TG_SECRET
if os.environ.get("TG_SECRET"):
    os.environ.pop("TG_USERNAME", None)
    os.environ.pop("TG_PASSWORD", None)
    os.environ.pop("USERNAME", None)  # Windows sets this to your login name

from tigergraph_mcp.server import serve

asyncio.run(serve())
```

---

## Step 5: Create the Cursor MCP Configuration

In your **project root folder**, create the directory `.cursor/` (if it doesn't exist), then create `.cursor/mcp.json`:

### Windows Configuration:

```json
{
  "mcpServers": {
    "tigergraph": {
      "command": "C:\\Users\\YourName\\AppData\\Local\\Programs\\Python\\Python312\\python.exe",
      "args": ["C:\\Users\\YourName\\YourProject\\start_mcp.py"],
      "env": {
        "TG_HOST": "https://your-tigergraph-host.tgcloud.io",
        "TG_RESTPP_PORT": "443",
        "TG_GSQL_PORT": "443",
        "TG_SECRET": "your-secret-value-here",
        "TG_GRAPH": "YourGraphName"
      }
    }
  }
}
```

### macOS / Linux Configuration:

```json
{
  "mcpServers": {
    "tigergraph": {
      "command": "/usr/bin/python3",
      "args": ["/path/to/your/project/start_mcp.py"],
      "env": {
        "TG_HOST": "https://your-tigergraph-host.tgcloud.io",
        "TG_RESTPP_PORT": "443",
        "TG_GSQL_PORT": "443",
        "TG_SECRET": "your-secret-value-here",
        "TG_GRAPH": "YourGraphName"
      }
    }
  }
}
```

### For Docker / Local TigerGraph:

```json
{
  "mcpServers": {
    "tigergraph": {
      "command": "python",
      "args": ["start_mcp.py"],
      "env": {
        "TG_HOST": "http://localhost",
        "TG_RESTPP_PORT": "9000",
        "TG_GSQL_PORT": "14240",
        "TG_SECRET": "your-secret-value-here",
        "TG_GRAPH": "YourGraphName"
      }
    }
  }
}
```

### Configuration Fields Explained:

| Field | Description | Example |
|-------|-------------|---------|
| `command` | **Full path** to your Python executable | `C:\...\python.exe` |
| `args` | **Full path** to `start_mcp.py` | `C:\...\start_mcp.py` |
| `TG_HOST` | Your TigerGraph instance URL | `https://tg-xxx.tgcloud.io` |
| `TG_RESTPP_PORT` | REST API port (`443` for Savanna, `9000` for Docker) | `443` |
| `TG_GSQL_PORT` | GSQL API port (`443` for Savanna, `14240` for Docker) | `443` |
| `TG_SECRET` | The secret you generated in Step 2 | `c7e5v2rdq...` |
| `TG_GRAPH` | Name of your graph (can be empty if no graph exists yet) | `MyGraph` |

---

## Step 6: Restart Cursor and Verify

1. **Close Cursor completely** and reopen it
2. Open your project folder in Cursor
3. Go to **Settings** (gear icon) -> **Tools & MCP**
4. You should see `tigergraph` listed under **"Installed MCP Servers"**
5. Make sure the **toggle is ON** (blue)

### What you should see:

```
Installed MCP Servers

  T  tigergraph
     ● 40 tools enabled ◇
     🔵 (toggle ON)
```

> **Note**: You might see a **red dot** with "Error - Show Output" instead of a green dot. This is a known cosmetic bug -- the MCP server still works. See the "Known Issues" section below.

---

## Step 7: Test the Connection

Open Cursor's **Agent Chat** (Cmd+L / Ctrl+L) and try these commands:

### Test 1: Check if MCP is connected
```
List all the metadata in my TigerGraph graph
```

### Test 2: Create a graph schema
```
Create a graph called TestGraph with a Person vertex (name STRING, age INT) 
and a Friendship edge between Person nodes
```

### Test 3: Add data
```
Add a node called Alice with age 30 to TestGraph
```

### Test 4: Query data
```
How many nodes are in TestGraph?
```

If these work, your setup is complete!

---

## Project Structure

After setup, your project should look like this:

```
YourProject/
├── .cursor/
│   └── mcp.json          # MCP server configuration
├── start_mcp.py           # MCP wrapper script (Windows workaround)
└── ... (your other files)
```

---

## Available MCP Tools (40 Total)

Once connected, Cursor's AI agent has access to 40 tools:

### Graph Operations
| Tool | Description |
|------|-------------|
| `create_schema` | Create a new graph with vertices and edges |
| `get_schema` | Retrieve the schema of a graph |
| `drop_graph` | Delete a graph entirely |
| `list_metadata` | List all vertices, edges, queries in a graph |
| `add_node` | Add a single node |
| `add_nodes` | Add multiple nodes at once* |
| `remove_node` | Remove a node |
| `has_node` | Check if a node exists |
| `get_node_data` | Get all attributes of a node |
| `get_nodes` | Retrieve nodes with optional filters |
| `get_node_edges` | Get all edges connected to a node |
| `add_edge` | Add a single edge |
| `add_edges_from` | Add multiple edges at once* |
| `has_edge` | Check if an edge exists |
| `get_edge_data` | Get attributes of an edge |
| `number_of_nodes` | Count nodes (optionally by type) |
| `number_of_edges` | Count edges (optionally by type) |
| `degree` | Get the degree of a node |
| `get_neighbors` | Find neighbors of a node |
| `breadth_first_search` | BFS traversal from a node |
| `clear_graph_data` | Clear all data from a graph* |

### Query Operations
| Tool | Description |
|------|-------------|
| `create_query` | Create a GSQL query |
| `install_query` | Install a created query |
| `run_query` | Execute an installed query* |
| `is_query_installed` | Check if a query is installed |
| `drop_query` | Delete a query |

### Vector Operations (requires TigerGraph 4.2+)
| Tool | Description |
|------|-------------|
| `upsert` | Insert/update nodes with vector data |
| `fetch_node` | Fetch a node's embedding vector |
| `fetch_nodes` | Fetch multiple nodes' vectors |
| `search` | Vector similarity search |
| `search_multi_vector_attributes` | Multi-vector search |
| `search_top_k_similar_nodes` | Find top-K similar nodes |

### Data Source Operations
| Tool | Description |
|------|-------------|
| `create_data_source` | Create an external data source (S3, GCS, etc.) |
| `get_data_source` | Get data source configuration |
| `get_all_data_sources` | List all data sources |
| `update_data_source` | Update a data source |
| `drop_data_source` | Delete a data source |
| `drop_all_data_sources` | Delete all data sources |
| `load_data` | Load data from files into the graph |
| `preview_sample_data` | Preview data from a file |

> *Tools marked with **\*** have a known bug when using secret-based authentication on TigerGraph Savanna. See "Known Issues" below.

---

## Known Issues

### 1. Red Dot in Cursor MCP Panel

**Symptom**: The tigergraph server shows a red "Error" dot in Cursor's MCP settings, even though it works fine.

**Cause**: The MCP server outputs non-JSON text during startup that Cursor interprets as an error.

**Impact**: Cosmetic only. All tools still work.

**Fix**: None needed -- just ignore the red dot.

### 2. Windows `USERNAME` Conflict

**Symptom**: All MCP tools fail with `"You can only use 'username/password' OR 'secret' OR 'token', not both"`.

**Cause**: Windows sets `USERNAME=YourName` which `tigergraphx` picks up as a TigerGraph username.

**Impact**: Breaks all tools on Windows.

**Fix**: Already handled in `start_mcp.py` (Step 4). No action needed if you use the wrapper script.

### 3. Batch REST Tools Fail with Secret Auth

**Symptom**: `add_nodes`, `add_edges_from`, `run_query`, and `clear_graph_data` fail silently.

**Cause**: `tigergraphx` doesn't acquire a JWT token for REST API calls when using secret-based auth.

**Impact**: 4 out of 40 tools don't work.

**Workaround**: Use single-item tools instead:
- Instead of `add_nodes` (batch) -> call `add_node` multiple times
- Instead of `add_edges_from` (batch) -> call `add_edge` multiple times
- For `run_query` -> no workaround available via MCP
- For `clear_graph_data` -> delete nodes individually or use TigerGraph's Admin Portal

---

## Troubleshooting

### MCP server not showing in Cursor

1. Make sure `.cursor/mcp.json` is in your **project root** (not inside `src/` or elsewhere)
2. Make sure the JSON is valid (no trailing commas, correct paths)
3. Restart Cursor completely

### "Tool not found" errors

1. Go to **Settings** -> **Tools & MCP**
2. Toggle the tigergraph server **OFF** then **ON**
3. If that doesn't work, restart Cursor

### All tools fail with authentication errors

1. Verify your `TG_SECRET` is correct and hasn't expired
2. Verify your `TG_HOST` URL is correct (should include `https://`)
3. Make sure `start_mcp.py` includes the `USERNAME` workaround (for Windows)
4. Check that your TigerGraph instance is running and accessible

### Python not found

1. Use the **full path** to `python.exe` in the `command` field
2. Run `where python` (Windows) or `which python3` (macOS/Linux) to find it

### MCP server keeps disconnecting

1. Restart Cursor
2. If it persists, check if your TigerGraph instance is running
3. Check if your internet connection is stable (for Savanna cloud)

---

## Quick Reference

### File Locations

| File | Location | Purpose |
|------|----------|---------|
| `mcp.json` | `.cursor/mcp.json` | MCP server config for Cursor |
| `start_mcp.py` | Project root | Wrapper script with bug workarounds |

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `TG_HOST` | Yes | TigerGraph instance URL |
| `TG_RESTPP_PORT` | Yes | REST API port (443 for cloud) |
| `TG_GSQL_PORT` | Yes | GSQL API port (443 for cloud) |
| `TG_SECRET` | Yes | Authentication secret |
| `TG_GRAPH` | Optional | Default graph name |

---

*Guide created from hands-on testing with TigerGraph Savanna 4.2 and Cursor IDE on Windows, March 2026.*
