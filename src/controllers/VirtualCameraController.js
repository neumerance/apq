import { app } from "electron";
import { spawn } from "child_process";
import os from "os";
import path from "path";

class VirtualCameraController {
  static BATFILE_PATH = app.isPackaged
    ? path.join(process.resourcesPath, "unitycapture", "Install", "Install.bat")
    : path.join(
        app.getAppPath(),
        "src",
        "unitycapture",
        "Install",
        "Install.bat"
      );

  constructor(appWindow) {
    this.appWindow = appWindow;
  }

  async init(callback = async () => {}) {
    if (os.platform() !== "win32") return;

    const bat = spawn("cmd.exe", ["/c", VirtualCameraController.BATFILE_PATH]);

    bat.stdout.on("data", async (data) => {
      console.log(`stdout: ${data}`);

      await callback();
    });

    bat.stderr.on("data", (data) => {
      console.error(`stderr: ${data}`);
    });

    bat.on("close", (code) => {
      console.log(`Batch file exited with code ${code}`);
    });
  }

  toggleVirtualCamState(toggle) {
    this.appWindow.webContents.send("toggle-virtual-cam-state", toggle);
  }
}

export default VirtualCameraController;
