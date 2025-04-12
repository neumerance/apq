import asyncio
from websocket_server import WebsocketServer

async def main():
  server = WebsocketServer()
  await server.run()

if __name__ == "__main__":
  asyncio.run(main())
