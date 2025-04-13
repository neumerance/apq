import { spawn } from "child_process";
import { app, screen, ipcMain } from "electron";
import path from "path";
import treeKill from "tree-kill";
// import OBSController from "./controllers/OBSController.js";
import AppWindowController from "./controllers/AppWindowController.js";
import FullScreenWindowsController from "./controllers/FullScreenWindowController.js";
import VirtualCameraController from "./controllers/VirtualCameraController.js";
import WebsocketHandler from "./websocket/handler/index.js";

const preloader = path.join(__dirname, "preload.js");
const distIndex = path.join(__dirname, "dist/index.html");
let pythonExec;
let pythonExecPath = path.join(
  app.getAppPath(),
  "src",
  "websocket",
  "server",
  "main.py"
);

if (app.isPackaged) {
  pythonExecPath = path.join(app.getAppPath(), "dist", "main.exe");
  pythonExec = spawn(pythonExecPath, []);
} else {
  pythonExec = spawn("python", [pythonExecPath], { shell: true });
}

pythonExec.stdout.on("data", (data) => {
  console.log(`stdout: ${data}`);
});
pythonExec.stderr.on("data", (data) => {
  console.error(`stderr: ${data}`);
});
pythonExec.on("close", (code) => {
  console.log(`child process exited with code ${code}`);
});

let websocketClient;
let virtualCamEnabled;

// const obsController = new OBSController();
const appWindowController = new AppWindowController(preloader, distIndex);
const fullScreenWindowsController = new FullScreenWindowsController(preloader);
const virtualCameraController = new VirtualCameraController(
  appWindowController
);

app.whenReady().then(() => {
  appWindowController.init();
});

ipcMain.on("open-fullscreen-window", (_event, displayId) => {
  // Open on external monitor if desired
  const displays = screen.getAllDisplays();
  const externalDisplay = displays.find((d) => d.id === displayId);

  fullScreenWindowsController.init(externalDisplay);
});

// Listen for frame data from Window A and send to Window B
ipcMain.on("frame-data", async (event, frame) => {
  fullScreenWindowsController.receiveFrames(frame);

  if (websocketClient?.connection?.connected && virtualCamEnabled)
    websocketClient.connection.sendUTF(frame);
});

// close canvas windows
ipcMain.on("close-window", () => {
  fullScreenWindowsController.closeWindow();
});

ipcMain.handle("get-displays", () => {
  const displays = screen.getAllDisplays();
  return displays;
});

ipcMain.handle("toggle-obs-virtual-cam", async (event, enableOBSVirtualCam) => {
  // if (enableOBSVirtualCam) await obsController.initOBSHeadless();
  // await obsController.toggleOBSVirtualCam(enableOBSVirtualCam);
});

ipcMain.handle("toggle-virtual-cam", async (event, opts) => {
  if (opts.isVirtualCamInitialized) {
    if (opts.toggle) {
      if (!websocketClient?.connection?.connected) {
        websocketClient = new WebsocketHandler();
        await websocketClient.connect();
      }
    }

    virtualCamEnabled = opts.toggle;
    virtualCameraController.toggleVirtualCamState(opts.toggle);
  } else {
    await virtualCameraController.init();
    app.quit();
  }
});

// Define your cleanup function.
const cleanupAndExit = () => {
  // Kill the Python subprocess if running.
  if (pythonExec && !pythonExec.killed) {
    // Send SIGTERM to allow graceful shutdown.
    treeKill(pythonExec.pid, "SIGTERM", (err) => {
      if (err) {
        console.error("Error killing process tree, force killing...", err);
        treeKill(pythonExec.pid, "SIGKILL");
      } else {
        console.log("Python process killed successfully.");
      }
    });
  }
  console.log("Cleanup completed.");
};

// Quit the app when all windows are closed (unless on macOS)
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// Call cleanup when Electron is quitting.
app.on("quit", () => {
  cleanupAndExit();
});

// Also listen for process signals (e.g. Ctrl+C)
process.on("SIGINT", () => {
  console.log("Received SIGINT, initiating cleanup...");
  cleanupAndExit();
  app.quit();
  setTimeout(() => process.exit(0), 100);
});
process.on("SIGTERM", () => {
  console.log("Received SIGTERM, initiating cleanup...");
  cleanupAndExit();
  app.quit();
  setTimeout(() => process.exit(0), 100);
});
