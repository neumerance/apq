import asyncio
import signal
import sys
from websocket_server import WebsocketServer
from received_frames_controller import ReceivedFramesController;

async def main():
  server = WebsocketServer()
  receivedFramesController = ReceivedFramesController()
  server.on_message = receivedFramesController.receive_frame

  await server.run()

def graceful_exit(signum, frame):
    print("Received SIGTERM, shutting down gracefully...")
    # Clean up any resources like closing sockets, etc.
    sys.exit(0)

# Register the SIGTERM handler
signal.signal(signal.SIGTERM, graceful_exit)

if __name__ == "__main__":
  asyncio.run(main())
