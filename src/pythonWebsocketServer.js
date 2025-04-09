import { spawn } from 'child_process';
import path from 'path';
import { app } from 'electron';

// This function will return the absolute path to main.py.
// You could use app.getAppPath() to get the application's root directory.
const getPythonScriptPath = () => {
  // app.getAppPath() returns the directory where your package.json is located.
  const appPath = app.getAppPath();

  // Adjust the relative path if necessary depending on your bundler output.
  // For example, if your main.js is built into a different folder than your src folder:
  return path.join(appPath, 'src', 'executables', 'main.py');
};

export const startPythonServer = () => {
  const pythonScriptPath = getPythonScriptPath();
  console.log(`Starting Python server from ${pythonScriptPath}`);

  const pythonProcess = spawn('python3', [pythonScriptPath]);

  pythonProcess.stdout.on('data', (data) => {
    console.log(`Python stdout: ${data}`);
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`Python stderr: ${data}`);
  });

  pythonProcess.on('close', (code) => {
    console.log(`Python server exited with code ${code}`);
  });
};

export default { startPythonServer };
