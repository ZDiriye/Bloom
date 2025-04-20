import io
import numpy as np
from PIL import Image, ImageOps
from flask import Flask, request, jsonify
# from flask_cors import CORS
import tensorflow as tf

app = Flask(__name__)
# CORS(app)  # Enable CORS

# Load the TFLite model and allocate tensors.
interpreter = tf.lite.Interpreter(model_path="model.tflite")
interpreter.allocate_tensors()

print(interpreter.get_signature_list())  # Inspect signatures

input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()

top_class_ids = [
  "1363227", "1392475", "1356022", "1364099", "1355937", "1359517", "1357330",
  "1358752", "1359620", "1363128", "1363991", "1355936", "1394460", "1363740",
  "1394994", "1364173", "1359616", "1364164", "1361824", "1361823", "1397364",
  "1358095", "1363130", "1389510", "1374048", "1367432", "1409238", "1397268",
  "1393614", "1356781", "1369887", "1393241", "1394420", "1398178", "1408774",
  "1435714", "1394591", "1385937", "1355932", "1358094", "1393425", "1393423",
  "1398592", "1408961", "1358133", "1358766", "1361656", "1384485", "1356257",
  "1358689", "1394382", "1359498", "1362490", "1357635", "1355990", "1363336",
  "1396824", "1400100", "1418146", "1356075", "1356382", "1360978", "1363764",
  "1394454", "1364159", "1393393", "1362294", "1369960", "1409295", "1359669",
  "1355978", "1391483", "1394404", "1398515", "1356111", "1360671", "1391192",
  "1390637", "1359625", "1364172", "1360998", "1391652", "1360588", "1358605",
  "1359488", "1361759", "1356126", "1391226", "1360153", "1398128", "1358751",
  "1360590", "1359485", "1394489", "1393792", "1363737", "1358105", "1421021",
  "1357677", "1363749"
]

input_shape = input_details[0]['shape']

def preprocess_image(image, target_size):
    image = ImageOps.exif_transpose(image)
    image = image.resize(target_size)
    image_array = np.array(image)
    if image_array.shape[-1] == 4:
        image_array = image_array[..., :3]
    image_array = np.expand_dims(image_array, axis=0)
    image_array = tf.keras.applications.efficientnet.preprocess_input(image_array)
    
    print(f"Preprocessed array shape: {image_array.shape}")
    print(f"Pixel range: {np.min(image_array)} - {np.max(image_array)}")
    print(f"Sample values (R channel): {image_array[0,100:105,100:105,0]}")
    
    return image_array.astype(np.float32)

@app.route('/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400

    file = request.files['image']
    try:
        image = Image.open(file.stream)
        if image.mode != 'RGB':
            image = image.convert('RGB')
    except Exception as e:
        return jsonify({'error': 'Invalid image'}), 400

    target_size = (input_shape[1], input_shape[2])
    input_data = preprocess_image(image, target_size)

    interpreter.set_tensor(input_details[0]['index'], input_data)
    interpreter.invoke()
    output_data = interpreter.get_tensor(output_details[0]['index'])

    predicted_class = int(np.argmax(output_data))
    probability = float(np.max(output_data))
    plant_id = top_class_ids[predicted_class]

    print(f"Predicted class: {predicted_class}, Probability: {probability}")
    print(f"Plant ID: {plant_id}")
    
    return jsonify({'plant_id': plant_id, 'probability': probability})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
