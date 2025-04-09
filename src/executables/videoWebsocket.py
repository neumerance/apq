# server.py
from flask import Flask, request
import base64
from io import BytesIO
from PIL import Image
import numpy as np
import cv2
import subprocess

# Define the Flask app
app = Flask(__name__)

@app.route('/frame', methods=['POST'])
def receive_frame():
    data = request.json
    frame_data = data['frame']

    # Decode the base64 frame data
    img_data = base64.b64decode(frame_data.split(",")[1])
    image = Image.open(BytesIO(img_data))

    # Convert the image to a format OpenCV can handle (numpy array)
    frame = np.array(image)

    # Process the frame (optional)

    # Feed the frame to akvirtualcam (assuming a command line utility to send frames)
    feed_to_akvirtualcam(frame)

    return 'OK', 200

def feed_to_akvirtualcam(frame):
    # Assuming the frame is in the correct format for akvirtualcam
    # You may need to save it as a temporary file or pipe it directly to akvirtualcam
    temp_file = '/tmp/video_frame.png'
    cv2.imwrite(temp_file, frame)

    # Call akvirtualcam to feed the frame (adjust command if necessary)
    subprocess.run(['akvcmd', 'feed', temp_file])

# Only run the app if this script is executed directly
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5230)
