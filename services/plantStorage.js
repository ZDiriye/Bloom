import { db } from './firebase';
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';

export async function savePlantIdentification(userId, plantData, observations) {
  try {
    // Save plant details in the "plants" collection.
    const plantRef = doc(db, 'plants', plantData.id.toString());
    const plantSnap = await getDoc(plantRef);
    if (!plantSnap.exists()) {
        await setDoc(plantRef, {
            id: plantData.id,
            name: plantData.name,
            commonName: plantData.preferred_common_name || '',
            defaultPhoto: plantData.default_photo?.medium_url || '',
            taxonomy: plantData.ancestors || [],
            wikipediaSummary: plantData.wikipedia_summary || '',
            wikipediaUrl: plantData.wikipedia_url || '',
            extinct: plantData.extinct || false,
            observationsCount: plantData.observations_count || 0,
            conservationStatus: plantData.conservation_status?.status || 'Not Evaluated',
            endemic: plantData.endemic || false,
            firstObservation: plantData.first_observation || 'Unknown',
            createdAt: serverTimestamp(),
          });                 
    }

    // Save a single observation document in the "observations" collection.
    // Use a custom doc id: userId_plantId ensures one document per user–plant pair.
    const obsDocId = `${userId}_${plantData.id}`;
    const obsRef = doc(db, 'observations', obsDocId);
    const obsSnap = await getDoc(obsRef);
    if (!obsSnap.exists() && observations.length > 0) {
      await setDoc(obsRef, {
        userId,
        plantId: plantData.id,
        // Store the entire array of observation details once.
        observations: observations.map(obs => ({
          location: obs.geojson?.coordinates || null,
          observedOn: obs.observed_on || null,
        })),
        createdAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error('savePlantIdentification error:', error);
    throw error;
  }
}