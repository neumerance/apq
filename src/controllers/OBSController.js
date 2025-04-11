import os from "os";
import path from "path";
import { spawn } from "child_process";
import OBSWebSocket from "obs-websocket-js";
import AppEmitter from "../helpers/AppEmitter";

class OBSController {
  static PLATFORM = os.platform();
  static DEFAULT_OBS_HEADLESS_ARGS = [
    "--startvirtualcam",
    "--minimize-to-tray",
    "--no-browser",
    "--disable-shutdown-check",
  ];
  static DARWIN_OBS_PATH = "/Applications/OBS.app/Contents/MacOS/obs";
  static WIN32_OBS_PATH =
    "C:\\Program Files\\obs-studio\\bin\\64bit\\obs64.exe";
  static LINUX_OBS_PATH = "obs";
  static WEBSOCKET = new OBSWebSocket("ws://localhost:4455");
  static WEBSOCKET_URL = "ws://localhost:4455";
  static WEBSOCKET_PASS = "ABC12abc";
  static EMITTER = new AppEmitter();
  static SCENE_NAME = "apq-scene";
  static INPUT_NAME = "APQ Video Frames";
  static TEMP_FILE = path.join(
    __dirname,
    "..",
    "assets",
    "images",
    "no-signal.jpg"
  );

  contructor() {
    this.obs = null;
    this.obsReady = false;
    this.socket = null;
    this.sourceInitialized = false;
  }

  // Init methods start
  async initOBSHeadless() {
    try {
      if (this.obs) return;

      if (OBSController.PLATFORM === "darwin") {
        this.obs = spawn(
          OBSController.DARWIN_OBS_PATH,
          OBSController.DEFAULT_OBS_HEADLESS_ARGS
        );
      } else if (OBSController.PLATFORM === "win32") {
        const obsArgs = [
          "--minimize-to-tray",
          "--disable-shutdown-check",
          "--profile",
          "apq-profile",
          "--collection",
          "apq-scenes",
        ];
        const obsPath = `C:\\Program Files\\obs-studio\\bin\\64bit\\obs64.exe`;
        this.obs = spawn(obsPath, obsArgs, {
          cwd: `C:\\Program Files\\obs-studio\\bin\\64bit`,
          detached: true,
          windowsHide: true,
          stdio: ["ignore", "pipe", "pipe"],
        });
        this.obs.unref();
      } else if (OBSController.PLATFORM === "linux") {
        this.obs = spawn(
          OBSController.LINUX_OBS_PATH,
          OBSController.DEFAULT_OBS_HEADLESS_ARGS
        );
      } else {
        throw new Error("❌ Unsupported OS");
      }

      this.obs.stdout.setEncoding("utf8");
      this.onWebsocketReady();
      this.onWebsocketDisconnected();
      this.onOBSReady();
      this.listenToOBSEvents();
    } catch (e) {
      console.log("❌ Unable to initialize OBS", e);
      throw new Error("❌ Unable to initialize OBS");
    }

    return;
  }

  async initWebsocket(retries = 30) {
    console.log("🚀 initiating obs websocket 🎬");

    const websocketURL = OBSController.WEBSOCKET_URL;
    const websocketPassword = OBSController.WEBSOCKET_PASS;
    this.socket = new OBSWebSocket(websocketURL);
    let response;
    for (let i = 0; i <= retries; i++) {
      try {
        response = await this.socket.connect(websocketURL);
      } catch (e) {
        console.log(`Retrying ${i}`);
        if (i === retries) {
          throw new Error("❌ Failed to connect to websocket server");
        }
        await new Promise((res) => setTimeout(res, 1000));
      }
    }

    if (response) {
      console.log("response", response);
      console.log("⚡️ WebSocket is connected");

      this.socket.on("ConnectionClosed", () => {
        OBSController.EMITTER.emit("WEBSOCKET_DISCONNECTED");
      });
      OBSController.EMITTER.emit("WEBSOCKET_READY");
    }
  }

  async initOBSSource() {
    try {
      const sceneExists = await this.isSceneExists();
      if (!sceneExists) {
        await this.createScene();
        await this.createInput();
      }

      await this.setCurrentProgram();

      this.sourceInitialized = true;
    } catch (e) {
      console.error("Unable to create OBS Source:", e);
      this.sourceInitialized = false;
    }
  }
  // Init methods end

  // Listeners start
  onOBSReady() {
    OBSController.EMITTER.on("OBS_READY", async () => {
      this.obsReady = true;
      await this.initWebsocket();
    });
  }

  onWebsocketReady() {
    OBSController.EMITTER.on("WEBSOCKET_READY", async () => {
      await this.initOBSSource();
      await this.disableOBSStudioMode();
      await this.toggleOBSVirtualCam();
    });
  }

  onWebsocketDisconnected() {
    OBSController.EMITTER.on("WEBSOCKET_DISCONNECTED", async () => {
      console.log("❌ Websocket got disconnect");
      this.socket = null;
      await this.initWebsocket();
    });
  }

  listenToOBSEvents() {
    console.log("listenToOBSEvents");
    this.obs.stdout.on("data", (data) => {
      console.log(`OBS stdout: ${data}`);
      if (!this.obsReady) OBSController.EMITTER.emit("OBS_READY");
    });

    this.obs.stderr.on("data", (data) => {
      console.error(`OBS stderr: ${data}`);
    });

    this.obs.on("close", (code) => {
      console.log(`OS process exited with code ${code}`);
    });
  }
  // Listerners end

  // getters start
  // getters end

  // checkers start
  async isSceneExists() {
    const scenes = await this.socket.call("GetSceneList");
    return scenes.scenes.some(
      (scene) => scene.sceneName === OBSController.SCENE_NAME
    );
  }
  // checkers end

  // methods start
  async disableOBSStudioMode() {
    await this.socket.call("SetStudioModeEnabled", {
      studioModeEnabled: false,
    });
  }

  async toggleOBSVirtualCam(bool = true) {
    if (!this.obs || !this.socket) return;

    await this.socket.call("ToggleVirtualCam", {
      outputActive: bool,
    });
    console.log("✅ OBS Virtual Cam started, ready to go!");
  }

  async createScene() {
    await this.socket.call("CreateScene", {
      sceneName: OBSController.SCENE_NAME,
    });
  }

  async createInput() {
    await this.socket.call("CreateInput", {
      sceneName: OBSController.SCENE_NAME,
      inputName: OBSController.INPUT_NAME,
      inputKind: "image_source",
      inputSettings: {},
    });
  }

  async setCurrentProgram() {
    await this.socket.call("SetCurrentProgramScene", {
      sceneName: OBSController.SCENE_NAME,
    });
  }

  async setInputSettings(frame) {
    await this.socket.call("SetInputSettings", {
      inputName: OBSController.INPUT_NAME,
      inputKind: "image_source",
      inputSettings: {
        file: frame,
      },
    });
  }

  async receiveFrames(frame) {
    if (!this.obs || !this.sourceInitialized) return;

    try {
      await this.setInputSettings(frame);
    } catch (e) {
      // console.log("❌ Unable to receive frames", e);
      // throw new Error("❌ Unable to receive frames");
    }
  }

  async quit() {
    if (!this.obs) return;

    if (OBSController.PLATFORM === "win32") {
      await this.obs.call("Shutdown");
    } else {
      await this.obs.kill("SIGTERM");
    }

    this.obs = null;
    this.socket = null;
    this.sourceInitialized = false;
  }
  // methods end
}

export default OBSController;
