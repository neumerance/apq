import pyvirtualcam
import base64
import cv2
import numpy as np
from pyvirtualcam import PixelFormat

class ReceivedFramesController:
    def base64_to_cv_frame(self, b64_string: str) -> np.ndarray:
        try:
            # Remove the data URL header (if exists)
            if ',' in b64_string:
                _, b64_data = b64_string.split(',', 1)
            else:
                b64_data = b64_string

            # Decode the base64 string into bytes
            img_bytes = base64.b64decode(b64_data)

            # Convert byte data to a 1D numpy array of type uint8
            np_arr = np.frombuffer(img_bytes, dtype=np.uint8)

            # Decode the image bytes into an OpenCV image
            frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

            if frame is None:
                raise ValueError("Failed to decode base64 string into a valid image frame.")

            return frame
        except Exception as e:
            print(f"Error decoding base64 frame: {e}")
            return None

    def receive_frame(self, b64_string):
        try:
            frame = self.base64_to_cv_frame(b64_string)
            if frame is None:
                print("Received an invalid frame, skipping...")
                return

            # Send the frame to the virtual camera
            with pyvirtualcam.Camera(
                width=1920, height=1080, fps=60, fmt=PixelFormat.BGR, device="APQ Virtual Camera"
            ) as cam:
                cam.send(frame)
                cam.sleep_until_next_frame()
        except pyvirtualcam.CameraError as e:
            print(f"Virtual camera error: {e}")
        except Exception as e:
            print(f"Error processing received frame: {e}")
