#!/usr/bin/env python3
"""
TigerGraph MCP Server Wrapper

This wrapper addresses two known issues:
1. Windows USERNAME environment variable conflicts
2. Non-JSON output that breaks JSON-RPC communication

Usage:
    python start_mcp.py

Environment variables required:
    TG_HOST: TigerGraph host URL
    TG_RESTPP_PORT: REST++ port (default: 443)
    TG_GS_PORT: GSQL port (default: 443)
    TG_SECRET: TigerGraph secret
    TG_GRAPH: Graph name (optional)
"""

import os
import sys
import json
import subprocess
import threading
import queue

def sanitize_env():
    """Remove or sanitize problematic environment variables for Windows."""
    env = os.environ.copy()
    
    # Fix Windows USERNAME conflict with pyTigerGraph
    # pyTigerGraph may misinterpret Windows USERNAME as TG username
    if 'USERNAME' in env and sys.platform == 'win32':
        env['_WINDOWS_USERNAME'] = env.pop('USERNAME')
    
    return env

def filter_json_output(line):
    """
    Filter output to only pass valid JSON-RPC messages.
    Returns None for non-JSON lines.
    """
    line = line.strip()
    if not line:
        return None
    
    try:
        # Try to parse as JSON
        parsed = json.loads(line)
        # Check if it looks like a JSON-RPC message
        if isinstance(parsed, dict) and ('jsonrpc' in parsed or 'id' in parsed or 'result' in parsed or 'error' in parsed):
            return line
    except json.JSONDecodeError:
        pass
    
    # Log non-JSON output to stderr for debugging
    print(f"[MCP DEBUG] Non-JSON output: {line}", file=sys.stderr)
    return None

def run_mcp_server():
    """Run the TigerGraph MCP server with filtered output."""
    env = sanitize_env()
    
    # Build the command to run the MCP server
    # Try different ways to invoke the TigerGraph MCP
    mcp_commands = [
        ['uvx', 'tigergraph-mcp'],
        ['tigergraph-mcp'],
        ['python', '-m', 'mcp_server_tigergraph'],
        ['python', '-m', 'tigergraph_mcp'],
    ]
    
    for cmd in mcp_commands:
        try:
            process = subprocess.Popen(
                cmd,
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                env=env,
                bufsize=0,  # Unbuffered
                text=True
            )
            
            # Create queues for thread-safe communication
            stdout_queue = queue.Queue()
            stderr_queue = queue.Queue()
            
            def read_stdout():
                """Read and filter stdout."""
                try:
                    for line in process.stdout:
                        filtered = filter_json_output(line)
                        if filtered:
                            stdout_queue.put(filtered)
                except Exception as e:
                    print(f"[MCP ERROR] stdout reader: {e}", file=sys.stderr)
            
            def read_stderr():
                """Forward stderr for debugging."""
                try:
                    for line in process.stderr:
                        print(f"[MCP STDERR] {line.strip()}", file=sys.stderr)
                except Exception as e:
                    print(f"[MCP ERROR] stderr reader: {e}", file=sys.stderr)
            
            def write_stdout():
                """Write filtered JSON to stdout."""
                try:
                    while True:
                        line = stdout_queue.get()
                        print(line, flush=True)
                except Exception as e:
                    print(f"[MCP ERROR] stdout writer: {e}", file=sys.stderr)
            
            def forward_stdin():
                """Forward stdin to the MCP process."""
                try:
                    for line in sys.stdin:
                        if process.stdin:
                            process.stdin.write(line)
                            process.stdin.flush()
                except Exception as e:
                    print(f"[MCP ERROR] stdin forwarder: {e}", file=sys.stderr)
            
            # Start reader/writer threads
            threads = [
                threading.Thread(target=read_stdout, daemon=True),
                threading.Thread(target=read_stderr, daemon=True),
                threading.Thread(target=write_stdout, daemon=True),
                threading.Thread(target=forward_stdin, daemon=True),
            ]
            
            for t in threads:
                t.start()
            
            # Wait for process to complete
            process.wait()
            return process.returncode
            
        except FileNotFoundError:
            continue
        except Exception as e:
            print(f"[MCP ERROR] Failed to run {cmd}: {e}", file=sys.stderr)
            continue
    
    print("[MCP ERROR] Could not find TigerGraph MCP server. Install with: pip install tigergraph-mcp", file=sys.stderr)
    return 1

def main():
    """Main entry point."""
    # Validate required environment variables
    required_vars = ['TG_HOST', 'TG_SECRET']
    missing = [var for var in required_vars if not os.environ.get(var)]
    
    if missing:
        print(f"[MCP ERROR] Missing required environment variables: {', '.join(missing)}", file=sys.stderr)
        sys.exit(1)
    
    # Log configuration (without secrets)
    print(f"[MCP INFO] Starting TigerGraph MCP Server", file=sys.stderr)
    print(f"[MCP INFO] Host: {os.environ.get('TG_HOST')}", file=sys.stderr)
    print(f"[MCP INFO] REST++ Port: {os.environ.get('TG_RESTPP_PORT', '443')}", file=sys.stderr)
    print(f"[MCP INFO] GSQL Port: {os.environ.get('TG_GS_PORT', '443')}", file=sys.stderr)
    print(f"[MCP INFO] Graph: {os.environ.get('TG_GRAPH', 'not specified')}", file=sys.stderr)
    
    exit_code = run_mcp_server()
    sys.exit(exit_code)

if __name__ == '__main__':
    main()
