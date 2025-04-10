import { BrowserWindow } from 'electron';

class FullScreenWindowsController {
  static TEMPLATE = 'src/fullscreen.html';

  constructor(preloader) {
    this.preloader = preloader;
    this.template = FullScreenWindowsController.TEMPLATE;
    this.fullscreenWindow = null;
  }

  init(display) {
    if (this.windowPresent()) {
      this.fullscreenWindow.focus();
      this.fullscreenWindow.setFullScreen(true);

      return;
    }

    const { x, y, width, height } = display.bounds;

    this.fullscreenWindow = new BrowserWindow({
        x,
        y,
        width,
        height,
        webPreferences: {
          preload: this.preloader,
        }
      });
    this.fullscreenWindow.loadFile(this.template);
    this.fullscreenWindow.focus();
    this.fullscreenWindow.setFullScreen(true);
  }

  receiveFrames(frame) {
    if (!this.windowPresent()) return;

    this.fullscreenWindow.webContents.send('frame-data', frame);
  }

  closeWindow() {
    if (!this.windowPresent()) return;

    this.fullscreenWindow.close();
  }

  windowPresent() {
    return this.fullscreenWindow && !this.fullscreenWindow.isDestroyed()
  }
}

export default FullScreenWindowsController;
