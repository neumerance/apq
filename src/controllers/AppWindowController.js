import { BrowserWindow, session, app } from "electron";
import path from "path";

class AppWindowController {
  static APP_URL = "http://localhost:5173";

  constructor(preloader, distIndex) {
    this.preloader = preloader;
    this.win = null;
  }

  init() {
    this.win = new BrowserWindow({
      width: 1280,
      height: 720,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: this.preloader,
        media: true,
      },
    });

    if (app.isPackaged) {
      const indexPath = path.join(
        process.resourcesPath, // Use resourcesPath for packaged apps
        "app.asar",
        ".vite",
        "renderer",
        "main_window",
        "index.html"
      );
      this.win.loadFile(indexPath);
    } else {
      this.win.loadURL(AppWindowController.APP_URL);
      this.win.webContents.openDevTools();
    }

    session.defaultSession.setPermissionRequestHandler(
      (webContents, permission, callback) => {
        if (permission === "media") {
          // Allow camera + mic
          callback(true);
        } else {
          callback(false);
        }
      }
    );
  }
}

export default AppWindowController;
