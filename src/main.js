import { app, BrowserWindow, screen, ipcMain } from 'electron'
import path from 'path'
import OBSVirtualCameraController from './controllers/OBSVirtualCameraController.js';

const OBSController = new OBSVirtualCameraController();

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  if (process.env.NODE_ENV === 'development') {
    // Load the Vite dev server during development
    win.loadURL('http://localhost:5173')  // Adjust if you use a different port
  } else {
    // In production, load the built files
    win.loadFile(path.join(__dirname, 'dist/index.html'))
  }
}

app.whenReady().then(() => {
  // pythonWebsocketServer.startPythonServer();
  createWindow();
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

  OBSController.receiveFrames(frame);
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
  if (enableOBSVirtualCam) await OBSController.initOBSHeadless();
  await OBSController.toggleOBSVirtualCam(enableOBSVirtualCam)
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// Gracefully quit OBS when Electron app is closed
app.on('quit', () => {
  OBSController.quit();
});
