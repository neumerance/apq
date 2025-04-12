import { app, screen, ipcMain } from "electron";
import path from "path";
// import OBSController from "./controllers/OBSController.js";
import AppWindowController from "./controllers/AppWindowController.js";
import FullScreenWindowsController from "./controllers/FullScreenWindowController.js";
import UnityCaptureController from "./controllers/UnityCaptureController.js";

import WebsocketHandler from "./websocket/handler/index.js";

const preloader = path.join(__dirname, "preload.js");
const distIndex = path.join(__dirname, "dist/index.html");
let websocketClient;

// const obsController = new OBSController();
const appWindowController = new AppWindowController(preloader, distIndex);
const fullScreenWindowsController = new FullScreenWindowsController(preloader);
const unityCaptureController = new UnityCaptureController(appWindowController);

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
  // obsController.receiveFrames(frame);
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
  if (!opts.isVirtualCamInitialized) await unityCaptureController.init();
  if (!websocketClient) {
    websocketClient = new WebsocketHandler();
    await websocketClient.connect();
  }

  unityCaptureController.toggleVirtualCamState(opts.toggle);
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// Gracefully quit OBS when Electron app is closed
app.on("quit", () => {
  // obsController.quit();
});
