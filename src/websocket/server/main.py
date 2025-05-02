import asyncio
import signal
import sys
from websocket_server import WebsocketServer
from received_frames_controller import ReceivedFramesController

async def main():
    try:
        server = WebsocketServer()
        received_frames_controller = ReceivedFramesController()
        server.on_message = received_frames_controller.receive_frame

        print("WebSocket server running on ws://localhost:876")
        await server.run()
    except Exception as e:
        print(f"Error in WebSocket server: {e}")
        sys.exit(1)

def graceful_exit(signum, frame):
    print("Received termination signal, shutting down gracefully...")
    # Perform any necessary cleanup here
    sys.exit(0)

# Register signal handlers for graceful shutdown
signal.signal(signal.SIGTERM, graceful_exit)
signal.signal(signal.SIGINT, graceful_exit)

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("Keyboard interrupt received, shutting down...")
        sys.exit(0)
