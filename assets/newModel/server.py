import io
import numpy as np
from PIL import Image
from flask import Flask, request, jsonify
import tensorflow as tf

app = Flask(__name__)

# Load the TFLite model and allocate tensors.
interpreter = tf.lite.Interpreter(model_path="model.tflite")
interpreter.allocate_tensors()
# After loading the model
print(interpreter.get_signature_list())  # Inspect input/output signatures
# Get input and output details.
input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()


# For example, assume the model expects input shape [1, height, width, channels]
input_shape = input_details[0]['shape']  # e.g., [1, 224, 224, 3]

from PIL import ImageOps  # Add this import at the top

def preprocess_image(image, target_size):
    # Fix EXIF orientation
    image = ImageOps.exif_transpose(image)
    
    # Resize image to target size
    image = image.resize(target_size)
    
    # Convert to numpy array
    image_array = np.array(image)
    
    # Remove alpha channel if present
    if image_array.shape[-1] == 4:
        image_array = image_array[..., :3]
    
    # Add batch dimension
    image_array = np.expand_dims(image_array, axis=0)
    
    # Use EfficientNet-specific preprocessing
    image_array = tf.keras.applications.efficientnet.preprocess_input(image_array)

    print(f"Preprocessed array shape: {image_array.shape}")
    print(f"Pixel range: {np.min(image_array)} - {np.max(image_array)}")
    print(f"Sample values (R channel): {image_array[0,100:105,100:105,0]}")
    
    return image_array.astype(np.float32)  # Ensure float32 type

@app.route('/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400

    file = request.files['image']
    try:
        image = Image.open(file.stream)
        # Convert to RGB only if not in RGB mode (don't force it)
        if image.mode != 'RGB':
            image = image.convert('RGB')
    except Exception as e:
        return jsonify({'error': 'Invalid image'}), 400

    # Get target size from model input shape
    target_size = (input_shape[1], input_shape[2])
    input_data = preprocess_image(image, target_size)

    # Run inference
    interpreter.set_tensor(input_details[0]['index'], input_data)
    interpreter.invoke()
    output_data = interpreter.get_tensor(output_details[0]['index'])

    # Postprocess output (for classification, get the predicted class and probability)
    predicted_class = int(np.argmax(output_data))
    probability = float(np.max(output_data))
    
    print(f"Predicted class: {predicted_class}, Probability: {probability}")

    return jsonify({'predicted_class': predicted_class, 'probability': probability})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
