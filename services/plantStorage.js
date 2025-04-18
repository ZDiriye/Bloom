import { db } from './firebase';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';

export async function savePlantIdentification(userId, plantData, observations, probability) {
  try {
    // Save plant details in the "plants" collection.
    const plantRef = doc(db, 'plants', plantData.id.toString());
    const plantSnap = await getDoc(plantRef);
    if (!plantSnap.exists()) {
        await setDoc(plantRef, {
            ...plantData,
            createdAt: serverTimestamp(),
        });                 
    }

    // Create a new observation document in the "observations" collection
    const observationsCollection = collection(db, 'observations');
    const newObservation = await addDoc(observationsCollection, {
      userId,
      plantId: plantData.id,
      observations: observations,
      probability: probability,
      createdAt: serverTimestamp(),
    });

    return {
      newObservationId: newObservation.id,
      observations: observations
    };
  } catch (error) {
    console.error('savePlantIdentification error:', error);
    throw error;
  }
}