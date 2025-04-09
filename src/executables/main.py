# main.py
from videoWebsocket import app  # Import the Flask app from server.py
from gunicorn.app.base import BaseApplication

class StandaloneApplication(BaseApplication):
  def __init__(self, app, options=None):
    self.options = options or {}
    self.application = app
    super().__init__()

  def load_config(self):
    config = {key: value for key, value in self.options.items()
              if key in self.cfg.settings and value is not None}
    for key, value in config.items():
      self.cfg.set(key.lower(), value)

  def load(self):
    return self.application

if __name__ == '__main__':
  options = {
    'bind': '0.0.0.0:5230',
    'workers': 4,
  }
  StandaloneApplication(app, options).run()

# Start the Flask app
# if __name__ == '__main__':
#     app.run(host='0.0.0.0', port=5230)
