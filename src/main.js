import { app, BrowserWindow, screen, ipcMain } from 'electron'
import path from 'path'
import fs from 'fs';
import os from 'os';
import pythonWebsocketServer from './pythonWebsocketServer.js';
import { exec, spawn } from 'child_process';
import OBSWebSocket from "obs-websocket-js";
const sharp = require('sharp');

// Define a fixed temporary file path for the vide frames
const tempFilePath = path.join(os.tmpdir(), "obs_temp_image.jpg");
let obsHeadless;
let obsWebsocket;
let ffmpeg;
let obsWebsocketInitialized = false;

const launchObsHeadless = () => {
  // Launch OBS in headless mode
  obsHeadless = spawn('/Applications/OBS.app/Contents/MacOS/obs', ['--startvirtualcam', '--minimize-to-tray', '--no-browser']);
  obsHeadless.stdout.setEncoding('utf8');

  // Log any output from OBS for debugging
  obsHeadless.stdout.on('data', (data) => {
    console.log(`OBS stdout: ${data}`);

    if (data.includes('Camera Extension activated successfully')) {
      console.log('✅ OBS Virtual Cam started, ready to go!');

      // You can now connect WebSocket or start your pipeline
      console.log('🚀 initiating obs websocket 🎬');
      initOBSWebsocket();
    }
  });

  obsHeadless.stderr.on('data', (data) => {
    console.error(`OBS stderr: ${data}`);
  });

  obsHeadless.on('close', (code) => {
    console.log(`OS process exited with code ${code}`);
  });
}

const initOBSWebsocket = () => {
  obsWebsocket = new OBSWebSocket('ws://localhost:4455');
  obsWebsocket.connect('ws://localhost:4455', 'ABC12abc').then(async (event) => {
    console.log('⚡️ WebSocket is connected:', event);

    await addCanvasAsSource(obsWebsocket);
  })
  .catch((error) => {
    console.error('Failed to connect to OBS WebSocket:', error);
  });
}

const addCanvasAsSource = async (socket) => {
  try {
    // First, check if the scene exists
    const scenes = await socket.call('GetSceneList');
    console.log('scenes', scenes);
    const sceneExists = scenes.scenes.some(scene => scene.sceneName === 'apq-scene');

    await socket.call('SetStudioModeEnabled', {
      studioModeEnabled: false
    });
    await socket.call('ToggleVirtualCam', {
      outputActive: true
    });

    if (!sceneExists) {
      // Now, proceed to create the input (source)
      await socket.call('CreateScene', {
        sceneName: 'apq-scene',  // Name of your scene
      });

      const response = await socket.call('CreateInput', {
        sceneName: 'apq-scene',  // Name of your scene
        inputName: 'APQ Video Frames',  // Name of the source
        inputKind: 'image_source',  // Use image source for static frames
        inputSettings: {
          file: tempFilePath  // Path to the image file
        }
      });

      console.log('Input Created:', response);
    }

    await socket.call('SetCurrentProgramScene', {
      sceneName: 'apq-scene',
    });

    obsWebsocketInitialized = true;
  } catch (e) {
    console.error('Unable to create OBS Source:', e);
    obsWebsocketInitialized = false;
  }
}

const initFFmpeg = () => {
  ffmpeg = spawn('ffmpeg', [
    '-f', 'avfoundation',           // Input format
    '-framerate', '60',             // Set the framerate
    '-pix_fmt', 'yuv420p',          // Set compatible pixel format
    '-i', '0',                      // Input source
    'pipe:1'
  ]);

  ffmpeg.stderr.on('data', (data) => {
    console.error(`FFmpeg stderr: ${data}`);
  });

  ffmpeg.on('close', (code) => {
    console.log(`FFmpeg exited with code ${code}`);
  });

  ffmpeg.on('error', (err) => {
    console.error('FFmpeg process error:', err);
  });
}

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
  // console.log('🚀 initiating ffmpeg 🎬');
  // initFFmpeg();
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

  if (obsWebsocket && obsWebsocketInitialized) {
    try {
      // const base64Data = frame.replace(/^data:image\/\w+;base64,/, "");
      // const buffer = Buffer.from(base64Data, 'base64');
      // fs.writeFileSync(tempFilePath, buffer);
      const response = await obsWebsocket.call('SetInputSettings', {
        inputName: 'APQ Video Frames',  // Name of the source
        inputKind: 'image_source',  // Use image source for static frames
        inputSettings: {
          file: frame  // Path to the image file
        }
      });
      console.log('SetInputSettings', response);
    } catch (e) {
      console.error('Unable to update input settings', e);
    }
  }

  if (ffmpeg) {
    // Send the frame data to ffmpeg's stdin
    try {
      const base64Data = frame.split(',')[1]; // Remove the "data:image/jpeg;base64," part
      const jpegBuffer = Buffer.from(base64Data, 'base64');

      if (ffmpeg && ffmpeg.stdin.writable) {
        ffmpeg.stdin.write(jpegBuffer);
      }
    } catch (err) {
      console.error('Failed to write frame to ffmpeg:', err);
    }
  }
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

ipcMain.handle('toggle-obs-virtual-cam', (event, enableOBSVirtualCam) => {
  if (enableOBSVirtualCam) {
    launchObsHeadless();
  } else {
    if (obsHeadless) {
      console.log('Closing OBS...');
      obsHeadless.kill('SIGINT'); // Gracefully close OBS using SIGINT (same as pressing Ctrl+C)
    }
    if(ffmpeg) ffmpeg.stdin.end();
  }
});


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// Gracefully quit OBS when Electron app is closed
app.on('quit', () => {
  if (obsHeadless) {
    console.log('Closing OBS...');
    obsHeadless.kill('SIGTERM'); // Gracefully close OBS using SIGINT (same as pressing Ctrl+C)
  }

  if(ffmpeg) ffmpeg.stdin.end();
});
