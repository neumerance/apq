// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  sendFrame: (frame) => ipcRenderer.send("frame-data", frame),
  onFrame: (callback) =>
    ipcRenderer.on("frame-data", (event, data) => callback(data)),
  openFullscreenDisplay: (displayInfo) =>
    ipcRenderer.send("open-fullscreen-window", displayInfo),
  getDisplays: () => ipcRenderer.invoke("get-displays"),
  closeWindow: () => ipcRenderer.send("close-window"),
  toggleOBSVirtualWebcam: (bool) => ipcRenderer.invoke("toggle-obs-virtual-cam", bool),
  toggleVirtualWebcam: (toggle, isVirtualCamInitialized) => ipcRenderer.invoke("toggle-virtual-cam", { toggle, isVirtualCamInitialized }),
  onToggleVirtualWebcam: (callback) => ipcRenderer.on("toggle-virtual-cam-state", (event, toggle) => callback(toggle)),
});
