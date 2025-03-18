// modelService.js

import * as tf from '@tensorflow/tfjs';
import { decodeJpeg, bundleResourceIO } from '@tensorflow/tfjs-react-native';
import classLabels from '../assets/class_names.json';

// References to your model files
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

/**
 * 1. Load the model (only once).
 */
export async function loadModel() {
  await tf.ready();
  model = await tf.loadGraphModel(bundleResourceIO(modelJson, modelWeights));
  console.log('Model loaded.');
  return model;
}

export async function preprocessImage(imageUri, isFrontCamera) { // Add isFrontCamera parameter
  try {
    const response = await fetch(imageUri);
    const imageDataArrayBuffer = await response.arrayBuffer();
    let rawImageData = new Uint8Array(imageDataArrayBuffer);

    let imageTensor = decodeJpeg(rawImageData);

    if (imageTensor.shape[2] === 4) {
      imageTensor = imageTensor.slice([0, 0, 0], [-1, -1, 3]);
    }

    // Resize first
    const resized = tf.image.resizeBilinear(imageTensor, [224, 224]);

    // Flip horizontally if front camera
    let processedTensor = resized;
    if (isFrontCamera) {
      processedTensor = tf.image.flipLeftRight(processedTensor);
    }

    // Normalize to [0, 1] range
    const normalized = processedTensor.toFloat().div(tf.scalar(255));

    return normalized.expandDims(0);
  } catch (error) {
    console.error('Image preprocessing error:', error);
    throw error;
  }
}

export async function predictImage(imageUri, isFrontCamera = false) { // Add isFrontCamera parameter
  try {
    if (!model) await loadModel();

    const inputTensor = await preprocessImage(imageUri, isFrontCamera); // Pass isFrontCamera
    const outputTensor = model.predict(inputTensor);
    const predictions = await outputTensor.data();
    outputTensor.dispose();

    const maxIndex = predictions.indexOf(Math.max(...predictions));
    return classLabels[maxIndex] || 'Unknown';
  } catch (error) {
    console.error('Prediction error:', error);
    throw error;
  }
}