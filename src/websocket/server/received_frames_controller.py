import pyvirtualcam
import base64
import cv2
import numpy as np

from pyvirtualcam import PixelFormat

class ReceivedFramesController:
  def base64_to_cv_frame(self, b64_string: str) -> np.ndarray:
    # Remove the data URL header (if exists)
    if ',' in b64_string:
        header, b64_data = b64_string.split(',', 1)
    else:
        b64_data = b64_string

    # Decode the base64 string into bytes
    img_bytes = base64.b64decode(b64_data)

    # Convert byte data to a 1D numpy array of type uint8
    np_arr = np.frombuffer(img_bytes, dtype=np.uint8)

    # Decode the image bytes into an OpenCV image
    # cv2.IMREAD_COLOR returns an image with 3 channels in BGR order.
    frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

    return frame

  def receive_frame(self, b64_string):
    frame = self.base64_to_cv_frame(b64_string)
    with pyvirtualcam.Camera(width=1920, height=1080, fps=60, fmt=PixelFormat.BGR, device="APQ Virtual Camera") as cam:
      cam.send(frame)
