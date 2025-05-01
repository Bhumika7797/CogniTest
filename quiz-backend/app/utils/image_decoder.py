import base64
import cv2
import numpy as np

def decode_base64_image(base64_str: str):
    try:
        # Handle possible header like: "data:image/jpeg;base64,..."
        if "," in base64_str:
            base64_str = base64_str.split(",")[1]

        decoded_data = base64.b64decode(base64_str)
        np_arr = np.frombuffer(decoded_data, np.uint8)
        image = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        if image is None:
            print("decode_base64_image: Failed to decode image with cv2.imdecode.")
        return image

    except Exception as e:
        print(f"decode_base64_image: Exception occurred - {str(e)}")
        return None