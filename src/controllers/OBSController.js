import os from 'os';
import path from 'path';
import { spawn } from 'child_process';
import OBSWebSocket from "obs-websocket-js";
import AppEmitter from '../helpers/AppEmitter';

class OBSController {
  static PLATFORM = os.platform();
  static DEFAULT_OBS_HEADLESS_ARGS = [
    '--startvirtualcam',
    '--minimize-to-tray',
    '--no-browser'
  ];
  static DARWIN_OBS_PATH = '/Applications/OBS.app/Contents/MacOS/obs';
  static WIN32_OBS_PATH = 'C:\\Program Files\\obs-studio\\bin\\64bit\\obs64.exe';
  static LINUX_OBS_PATH = 'obs';
  static WEBSOCKET = new OBSWebSocket('ws://localhost:4455');
  static WEBSOCKET_URL = 'ws://localhost:4455';
  static WEBSOCKET_PASS = 'ABC12abc';
  static EMITTER = new AppEmitter();
  static SCENE_NAME = 'apq-scene';
  static INPUT_NAME = 'APQ Video Frames';
  static TEMP_FILE = path.join(os.tmpdir(), "obs_temp_image.jpg");

  contructor() {
    this.obs = null;
    this.socket = null;
    this.sourceInitialized = false;
  }

  // Init methods start
  async initOBSHeadless() {
    try {
      if (this.obs) return;

      if (OBSController.PLATFORM === 'darwin') {
        this.obs = spawn(OBSController.DARWIN_OBS_PATH, OBSController.DEFAULT_OBS_HEADLESS_ARGS);
      } else if (OBSController.PLATFORM === 'win32') {
        this.obs = spawn(OBSController.WIN32_OBS_PATH, OBSController.DEFAULT_OBS_HEADLESS_ARGS);
      } else if (OBSController.PLATFORM === 'linux') {
        this.obs = spawn(OBSController.LINUX_OBS_PATH, OBSController.DEFAULT_OBS_HEADLESS_ARGS);
      } else {
        throw new Error("❌ Unsupported OS");
      }

      this.obs.stdout.setEncoding('utf8');
      this.onWebsocketReady();
      this.onOBSReady();
      this.listenToOBSEvents();
    } catch(e) {
      console.log('❌ Unable to initialize OBS', e);
      throw new Error('❌ Unable to initialize OBS');
    }

    return;
  }

  async initWebsocket() {
    console.log('🚀 initiating obs websocket 🎬');

    const websocketURL = OBSController.WEBSOCKET_URL;
    const websocketPassword = OBSController.WEBSOCKET_PASS
    this.socket = new OBSWebSocket(websocketURL);
    this.socket.connect(websocketURL, websocketPassword).then(async (event) => {
      console.log('⚡️ WebSocket is connected:', event);

      OBSController.EMITTER.emit('WEBSOCKET_READY');
    })
    .catch((error) => {
      console.error('Failed to connect to OBS WebSocket:', error);
    });
  }

  async initOBSSource() {
    try {
      const sceneExists = await this.isSceneExists();
      if (!sceneExists) {
        await this.createScene();
        await this.createInput();
      }

      await this.setCurrentProgram();

      this.sourceInitialized = true;
    } catch (e) {
      console.error('Unable to create OBS Source:', e);
      this.sourceInitialized = false;
    }
  }
  // Init methods end

  // Listeners start
  onOBSReady() {
    OBSController.EMITTER.on('OBS_READY', async () => {
      await this.initWebsocket();
    });
  }

  onWebsocketReady() {
    OBSController.EMITTER.on('WEBSOCKET_READY', async () => {
      await this.initOBSSource();
      await this.disableOBSStudioMode();
      await this.toggleOBSVirtualCam();
    });
  }

  listenToOBSEvents() {
    this.obs.stdout.on('data', (data) => {
      console.log(`OBS stdout: ${data}`);

      if (data.includes('Camera Extension activated successfully')) {
        console.log('✅ OBS Virtual Cam started, ready to go!');

        OBSController.EMITTER.emit('OBS_READY');
      }
    });

    this.obs.stderr.on('data', (data) => {
      console.error(`OBS stderr: ${data}`);
    });

    this.obs.on('close', (code) => {
      console.log(`OS process exited with code ${code}`);
    });
  }
  // Listerners end

  // getters start
  // getters end

  // checkers start
  async isSceneExists() {
    const scenes = await this.socket.call('GetSceneList');
    return scenes.scenes.some(scene => scene.sceneName === OBSController.SCENE_NAME);
  }
  // checkers end

  // methods start
  async disableOBSStudioMode() {
    await this.socket.call('SetStudioModeEnabled', {
      studioModeEnabled: false
    });
  }

  async toggleOBSVirtualCam(bool = true) {
    if (!this.obs || !this.socket) return;

    await this.socket.call('ToggleVirtualCam', {
      outputActive: bool
    });
  }

  async createScene() {
    await this.socket.call('CreateScene', {
      sceneName: OBSController.SCENE_NAME
    });
  }

  async createInput() {
    await this.socket.call('CreateInput', {
      sceneName: OBSController.SCENE_NAME,
      inputName: OBSController.INPUT_NAME,
      inputKind: 'image_source',
      inputSettings: {
        file: OBSController.TEMP_FILE
      }
    });
  }

  async setCurrentProgram() {
    await this.socket.call('SetCurrentProgramScene', {
      sceneName: OBSController.SCENE_NAME,
    });
  }

  async setInputSettings(frame) {
    await this.socket.call('SetInputSettings', {
      inputName: OBSController.INPUT_NAME,
      inputKind: 'image_source',
      inputSettings: {
        file: frame
      }
    });
  }

  async receiveFrames(frame) {
    if (!this.obs || !this.sourceInitialized) return;

    try {
      await this.setInputSettings(frame);
    } catch(e) {
      console.log('❌ Unable to receive frames', e);
      throw new Error('❌ Unable to receive frames');
    }
  }

  quit() {
    if (!this.obs) return;

    this.obs.kill('SIGTERM');
    this.obs = null;
    this.socket = null;
    this.sourceInitialized = false;
  }
  // methods end
}

export default OBSController;
