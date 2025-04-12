import asyncio
import websockets

class WebsocketServer:
	def __init__(self):
		self.server = None
		self.on_message = None

	async def run(self):
		self.server = await websockets.serve(self.echo, "localhost", 8765, subprotocols=["json"])
		print("WebSocket server running on ws://localhost:8765")

		try:
			# Sleep forever, until canceled with Ctrl+C
			while True:
				await asyncio.sleep(1)
		except KeyboardInterrupt:
			print("\nShutting down server...")
			await self.stop()

	async def echo(self, websocket, path):
		async for message in websocket:
			if callable(self.onMessage):
				self.onMessage(message)

	async def stop(self):
		if self.server:
			self.server.close()
			await self.server.wait_closed()
			print("WebSocket server has been stopped.")

if __name__ == "__main__":
	try:
		asyncio.run(WebsocketServer().run())
	except KeyboardInterrupt:
		print("\nForced shutdown.")
