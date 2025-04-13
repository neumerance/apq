## Dependencies

- Pythong 3.7
- node v20.19.0
- pip pyinstaller

## Python

This application is bundled with python 3.7
`src\websocket\server\main.py` serves a websocket server to process any backend requiring tasks.
Currently, we are using it to receive and process video frames.
We send this video frame to our virtual camera `Unity Video Capture`

## Unitycapture

Unity capture server this application a virtual camera.
dir `src\unitycapture`

## Building the application

### Bundling with Python

run `python -m venv .venv`
run `.venv\Scripts\activate`
run `pip install -r requirements.txt`
run `pyinstaller --onefile src\websocket\server\main.py`
