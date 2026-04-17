import os
import sys
import asyncio
import logging

logging.basicConfig(level=logging.WARN, stream=sys.stderr)

if sys.platform == "win32":
    os.environ.pop("USERNAME", None)

from tigergraph_mcp import serve

asyncio.run(serve())
