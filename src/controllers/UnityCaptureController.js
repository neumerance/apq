import { app } from "electron";
import { spawn } from "child_process";
import os from "os";
import path from "path";

class UnityCaptureController {
  static BATFILE_PATH = path.join(
    app.getAppPath(),
    "src",
    "unitycapture",
    "Install",
    "Install.bat"
  );

  async init() {
    if (os.platform() !== "win32") return;

    const bat = spawn("cmd.exe", ["/c", UnityCaptureController.BATFILE_PATH]);

    bat.stdout.on("data", (data) => {
      console.log(`stdout: ${data}`);
    });

    bat.stderr.on("data", (data) => {
      console.error(`stderr: ${data}`);
    });

    bat.on("close", (code) => {
      console.log(`Batch file exited with code ${code}`);
    });
  }
}

export default UnityCaptureController;
