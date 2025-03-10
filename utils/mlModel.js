import * as tf from '@tensorflow/tfjs';
import { decodeJpeg, bundleResourceIO } from '@tensorflow/tfjs-react-native';
import classLabels from '../assets/class_names.json';

// Model files - make sure these paths match your actual file structure
const modelJson = require('../assets/model/model.json');
const modelWeights = [
  require('../assets/model/group1-shard1of8.bin'),
  require('../assets/model/group1-shard2of8.bin'),
  require('../assets/model/group1-shard3of8.bin'),
  require('../assets/model/group1-shard4of8.bin'),
  require('../assets/model/group1-shard5of8.bin'),
  require('../assets/model/group1-shard6of8.bin'),
  require('../assets/model/group1-shard7of8.bin'),
  require('../assets/model/group1-shard8of8.bin'),
];

let model = null;

async function loadMyModel() {
  if (!model) {
    await tf.ready();
    model = await tf.loadLayersModel(bundleResourceIO(modelJson, modelWeights));
    console.log('Model loaded');
  }
  return model;
}

async function preprocessImage(imageUri) {
  const response = await fetch(imageUri);
  const imageDataArrayBuffer = await response.arrayBuffer();
  const rawImageData = new Uint8Array(imageDataArrayBuffer);
  
  let imageTensor = decodeJpeg(rawImageData);
  const resized = tf.image.resizeBilinear(imageTensor, [224, 224]);
  return resized.expandDims(0);
}

export async function predictImage(imageUri) {
  try {
    console.log('Starting prediction for image:', imageUri);

    const loadedModel = await loadMyModel();

    const inputTensor = await preprocessImage(imageUri);
    console.log('Input tensor shape:', inputTensor.shape);

    const outputTensor = loadedModel.predict(inputTensor);
    const predictions = await outputTensor.data();
    console.log('Raw predictions (first 5):', Array.from(predictions).slice(0, 5), '...');

    let maxProb = -Infinity;
    let predictedClassIndex = -1;
    for (let i = 0; i < predictions.length; i++) {
      if (predictions[i] > maxProb) {
        maxProb = predictions[i];
        predictedClassIndex = i;
      }
    }

    console.log('Predicted class index:', predictedClassIndex);
    console.log('Predicted probability:', maxProb);

    inputTensor.dispose();
    outputTensor.dispose();

    if (predictedClassIndex >= 0 && predictedClassIndex < classLabels.length) {
      return classLabels[predictedClassIndex];
    } else {
      console.error('Invalid class index:', predictedClassIndex, 'class_labels length:', classLabels.length);
      return 'Unknown';
    }
  } catch (error) {
    console.error('Error during prediction:', error);
    return 'Error: ' + error.message;
  }
}