import { app, BrowserWindow } from 'electron'
import path from 'path'
import pythonWebsocketServer from './pythonWebsocketServer.js';

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
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
  pythonWebsocketServer.startPythonServer();
  createWindow();
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
