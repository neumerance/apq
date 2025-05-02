import { spawn } from "child_process";
import { app, screen, ipcMain } from "electron";
import path from "path";
import treeKill from "tree-kill";
import { installExtension, VUEJS_DEVTOOLS } from "electron-devtools-installer";
import AppWindowController from "./controllers/AppWindowController.js";
import FullScreenWindowsController from "./controllers/FullScreenWindowController.js";
import VirtualCameraController from "./controllers/VirtualCameraController.js";
import WebsocketHandler from "./websocket/handler/index.js";

const preloader = path.join(__dirname, "preload.js");
let pythonExec;
let pythonExecPath;

// Function to start the Python WebSocket server
const startPythonServer = () => {
  try {
    if (app.isPackaged) {
      pythonExecPath = path.join(process.resourcesPath, "main.exe");
      pythonExec = spawn(pythonExecPath, []);
    } else {
      pythonExecPath = path.join(
        app.getAppPath(),
        "src",
        "websocket",
        "server",
        "main.py"
      );
      pythonExec = spawn("python", [pythonExecPath], { shell: true });
    }

    pythonExec.stdout.on("data", (data) => {
      console.log(`Python Server stdout: ${data.toString().trim()}`);
    });

    pythonExec.stderr.on("data", (data) => {
      console.error(`Python Server stderr: ${data.toString().trim()}`);
    });

    pythonExec.on("close", (code) => {
      console.log(`Python Server exited with code ${code}`);
      if (code !== 0) {
        console.error(
          "Python server exited unexpectedly. Check logs for details."
        );
      }
    });
  } catch (error) {
    console.error("Failed to start Python WebSocket server:", error);
  }
};

// Cleanup function to terminate the Python process
const cleanupAndExit = () => {
  if (pythonExec && !pythonExec.killed) {
    treeKill(pythonExec.pid, "SIGTERM", (err) => {
      if (err) {
        console.error("Error killing Python process, force killing...", err);
        treeKill(pythonExec.pid, "SIGKILL");
      } else {
        console.log("Python process terminated successfully.");
      }
    });
  }
  console.log("Cleanup completed.");
};

let fullScreenWindowsController;
let virtualCameraController;
let websocketClient;
let virtualCamEnabled;

// IPC handlers
ipcMain.on("open-fullscreen-window", (_event, displayId) => {
  const displays = screen.getAllDisplays();
  const externalDisplay = displays.find((d) => d.id === displayId);
  fullScreenWindowsController.init(externalDisplay);
});

ipcMain.on("frame-data", async (event, frame) => {
  fullScreenWindowsController.receiveFrames(frame);

  if (websocketClient?.connection?.connected && virtualCamEnabled)
    websocketClient.connection.sendUTF(frame);
});

ipcMain.on("close-window", () => {
  fullScreenWindowsController.closeWindow();
});

ipcMain.handle("get-displays", () => {
  const displays = screen.getAllDisplays();
  return displays;
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

// Start the Python server when the app is ready
app.whenReady().then(() => {
  startPythonServer();

  if (!app.isPackaged) {
    installExtension(VUEJS_DEVTOOLS)
      .then((ext) => console.log(`Extension ${ext.name} installed`))
      .catch((error) => console.log(`Unable to install extension:`, error));
  }

  const appWindowController = new AppWindowController(preloader);
  appWindowController.init();

  fullScreenWindowsController = new FullScreenWindowsController(preloader);
  virtualCameraController = new VirtualCameraController(
    appWindowController.win
  );
});

// Handle app lifecycle events
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("quit", () => {
  cleanupAndExit();
});

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
