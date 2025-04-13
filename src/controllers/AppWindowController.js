import { BrowserWindow, session } from "electron";

class AppWindowController {
  static APP_URL = "http://localhost:5173";

  constructor(preloader, distIndex) {
    this.preloader = preloader;
    this.distIndex = distIndex;
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

    if (process.env.NODE_ENV === "development") {
      this.win.loadURL(AppWindowController.APP_URL); // Adjust if you use a different port
    } else {
      this.win.loadFile(this.distIndex);
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
