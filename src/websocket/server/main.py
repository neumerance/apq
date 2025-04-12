import asyncio
from websocket_server import WebsocketServer
from received_frames_controller import ReceivedFramesController;

async def main():
  server = WebsocketServer()
  receivedFramesController = ReceivedFramesController()
  server.on_message = receivedFramesController.receive_frame

  await server.run()

if __name__ == "__main__":
  asyncio.run(main())
