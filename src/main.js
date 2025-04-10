import { app, BrowserWindow, screen, ipcMain } from 'electron'
import path from 'path'
import OBSController from './controllers/OBSController.js';
import AppWindowController from './controllers/AppWindowController.js';

const preloader = path.join(__dirname, 'preload.js');
const distIndex = path.join(__dirname, 'dist/index.html');

const obsController = new OBSController();
const appWindowController = new AppWindowController(preloader, distIndex);

app.whenReady().then(() => {
  appWindowController.init();
})

let canvasWindow;

ipcMain.on('open-fullscreen-window', (_event, displayLabel) => {
  if (canvasWindow && !canvasWindow.isDestroyed()) {
    canvasWindow.focus();
    return;
  }

  // Open on external monitor if desired
  const displays = screen.getAllDisplays();
  const externalDisplay = displays.find(d => d.label === displayLabel);
  const { x, y, width, height } = externalDisplay.bounds;

  // const windowBounds = externalDisplay ? externalDisplay.bounds : { x: 0, y: 0, width: 1280, height: 720 };

  canvasWindow = new BrowserWindow({
    x,
    y,
    width,
    height,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    }
  });

  canvasWindow.loadFile('src/fullscreen.html');
});

// Listen for frame data from Window A and send to Window B
ipcMain.on('frame-data', async (event, frame) => {
  if (canvasWindow && !canvasWindow.isDestroyed()) {
    canvasWindow.webContents.send('frame-data', frame);  // Send to Window B
    canvasWindow.setFullScreen(true);
  }

  obsController.receiveFrames(frame);
});

// close canvas windows
ipcMain.on('close-window', () => {
  if (canvasWindow && !canvasWindow.isDestroyed()) {
    canvasWindow.close();  // Close Window B gracefully
  }
});

ipcMain.handle('get-displays', () => {
  const displays = screen.getAllDisplays();
  return displays;
});

ipcMain.handle('toggle-obs-virtual-cam', async (event, enableOBSVirtualCam) => {
  if (enableOBSVirtualCam) await obsController.initOBSHeadless();
  await obsController.toggleOBSVirtualCam(enableOBSVirtualCam)
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// Gracefully quit OBS when Electron app is closed
app.on('quit', () => {
  obsController.quit();
});
