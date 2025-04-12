import { client as WebSocketClient } from "websocket";

class WebsocketHandler {
  static WEBSOCKET_URL = "ws://localhost:8765";
  static CONNECTION_RETRY = 15;

  constructor() {
    this.client = new WebSocketClient();
    this.client.on("connectFailed", (error) => this.onError(error));
    this.client.on("connect", (connection) => this.onConnect(connection));
    this.connected = false;
  }

  async connect() {
    let i = 1;
    while (1 <= WebsocketHandler.CONNECTION_RETRY && this.connected === false) {
      if (i >= WebsocketHandler.CONNECTION_RETRY)
        throw new Error("Websocket connection failed!");

      if (i == 1) {
        console.log(`Connecting websocket`);
      } else {
        console.log(`Retrying websocket connection: ${i}`);
      }

      this.client.connect(WebsocketHandler.WEBSOCKET_URL, "json");
      i++;

      await new Promise((res) => setTimeout(res, 1000));
    }
  }

  onError(error) {
    console.log("Connect Error: " + error.toString());
    this.connected = false;
  }

  onMessage(message) {
    if (message.type !== "utf8") return;
    console.log("Received: '" + message.utf8Data + "'");
  }

  onConnect(connection) {
    this.connected = true;
    console.log("WebSocket Client Connected");
    connection.on("error", (error) => this.onError(error));
    connection.on("close", () =>
      console.log("echo-protocol Connection Closed")
    );
    connection.on("message", (message) => onMessage(message));
  }
}

export default WebsocketHandler;
