import { db } from './firebase';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';

export async function savePlantIdentification(userId, plantData, observations) {
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
    await addDoc(observationsCollection, {
      userId,
      plantId: plantData.id,
      observations: observations,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('savePlantIdentification error:', error);
    throw error;
  }
}