import * as tf from '@tensorflow/tfjs';
import { decodeJpeg, bundleResourceIO } from '@tensorflow/tfjs-react-native';
import * as ImageManipulator from 'expo-image-manipulator';

// Load your JSON mapping of plant IDs to names
import classLabels from '../assets/class_names.json';

// Model files
const modelJson = require('../assets/model/model.json');
const modelWeights = [
  require('../assets/model/group1-shard1of7.bin'),
  require('../assets/model/group1-shard2of7.bin'),
  require('../assets/model/group1-shard3of7.bin'),
  require('../assets/model/group1-shard4of7.bin'),
  require('../assets/model/group1-shard5of7.bin'),
  require('../assets/model/group1-shard6of7.bin'),
  require('../assets/model/group1-shard7of7.bin'),
];

const topClassIDs = [
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
];

let model = null;

/**
 * Convert a base64 string to a Uint8Array using tf.util.encodeString.
 */
function base64ToUint8Array(base64) {
  // Remove any data URL prefix.
  if (base64.startsWith('data:image')) {
    base64 = base64.split(',')[1];
  }
  return tf.util.encodeString(base64, 'base64');
}

/**
 * Fix image orientation and return a base64 string.
 */
async function fixImageOrientation(imageUri) {
  const result = await ImageManipulator.manipulateAsync(
    imageUri,
    [],
    { compress: 1, format: ImageManipulator.SaveFormat.JPEG, base64: true }
  );
  return result.base64;
}

/**
 * Load the model (only once).
 */
export async function loadModel() {
  await tf.ready();
  model = await tf.loadGraphModel(bundleResourceIO(modelJson, modelWeights));
  console.log('Model loaded.');
  return model;
}

/**
 * Preprocess the image:
 * 1) Fix orientation and get base64.
 * 2) Convert base64 to Uint8Array.
 * 3) Decode JPEG.
 * 4) Remove alpha channel if present.
 * 5) Resize to (224,224).
 * 6) Flip if using front camera.
 * 7) Normalize pixels from [0,255] to [-1,1].
 * 8) Expand dims to shape [1,224,224,3].
 */
export async function preprocessImage(imageUri, isFrontCamera = false) {
  try {
    const imageBase64 = await fixImageOrientation(imageUri);
    const imageBytes = base64ToUint8Array(imageBase64);
    let imageTensor = decodeJpeg(imageBytes);

    // Remove alpha channel if it exists.
    if (imageTensor.shape[2] === 4) {
      imageTensor = imageTensor.slice([0, 0, 0], [-1, -1, 3]);
    }

    // Resize to 224x224.
    let processedTensor = tf.image.resizeBilinear(imageTensor, [224, 224]);

    // Flip if using front camera.
    if (isFrontCamera) {
      processedTensor = tf.image.flipLeftRight(processedTensor);
    }

    // Normalize: [0,255] → [-1,1].
    processedTensor = processedTensor
      .toFloat()
      .div(tf.scalar(255))
      .mul(tf.scalar(2))
      .sub(tf.scalar(1));

    // Log basic tensor info.
    processedTensor.mean().data().then(mean => {
      console.log('Tensor mean:', mean[0]);
    });
    console.log('Input tensor shape:', processedTensor.shape);

    // Expand dims: [1,224,224,3].
    return processedTensor.expandDims(0);
  } catch (error) {
    console.error('Image preprocessing error:', error);
    throw error;
  }
}

/**
 * Predict the image class.
 */
export async function predictImage(imageUri, isFrontCamera = false) {
  try {
    if (!model) {
      await loadModel();
    }

    const inputTensor = await preprocessImage(imageUri, isFrontCamera);
    const outputTensor = model.predict(inputTensor);

    // Get predictions as an array.
    const predictions = await outputTensor.data();
    outputTensor.dispose();

    // Log a few prediction values to check differences.
    console.log('Prediction values (first 5):', predictions.slice(0, 5));

    // Identify the class with the highest probability.
    const maxIndex = predictions.indexOf(Math.max(...predictions));
    console.log('Max index:', maxIndex);

    // Map index to plant ID.
    const predictedID = topClassIDs[maxIndex];
    console.log('Predicted ID:', predictedID);

    // Look up species name from the JSON dictionary.
    const predictedSpeciesName = classLabels[predictedID] || 'Unknown';
    console.log('Predicted species name:', predictedSpeciesName);

    // Format the name: change underscores to spaces and capitalize each word.
    const formattedName = predictedSpeciesName
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');

    return formattedName;
  } catch (error) {
    console.error('Prediction error:', error);
    throw error;
  }
}
