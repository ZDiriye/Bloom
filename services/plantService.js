import { db } from './firebase';
import { fetchPlantDataBasic, fetchPlantDetails, fetchPlantObservations } from './api/inaturalist';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { savePlantIdentification } from './plantStorage';

class PlantService {
  async fetchPlantAndSave(plantName, userId) {
    try {
      // Step 1: Get basic plant data (to get the plant id).
      const basicData = await fetchPlantDataBasic(plantName);
      if (!basicData) throw new Error('Plant not found');
      const plantId = basicData.id;
      
      // Step 2: Check if the user has already identified this plant.
      const existingData = await this.getPlantInfo(userId, plantId);
      if (existingData) {
        // If already identified, return the saved data.
        return existingData;
      }
      
      // Step 3: No identification exists; fetch detailed data and observations.
      const detailedData = await fetchPlantDetails(plantId);
      const obsData = await fetchPlantObservations(plantId);
      const observations = obsData?.results || [];
      
      // Use detailedData as the full plant info.
      const plantData = detailedData;
      
      // Step 4: Save the plant data and the single observation document.
      await savePlantIdentification(userId, plantData, observations);
      
      // Step 5: Retrieve and return the saved data.
      return await this.getPlantInfo(userId, plantId);
    } catch (error) {
      console.error('fetchPlantAndSave error:', error);
      throw error;
    }
  }
  
  async getPlantInfo(userId, plantId) {
    try {
      // Retrieve plant details from the "plants" collection.
      const plantRef = doc(db, 'plants', plantId.toString());
      const plantSnap = await getDoc(plantRef);
      if (!plantSnap.exists()) return null;
      const plantData = plantSnap.data();
  
      // Retrieve the observation document for this user–plant pair.
      const obsDocId = `${userId}_${plantId}`;
      const obsRef = doc(db, 'observations', obsDocId);
      const obsSnap = await getDoc(obsRef);
      const observations = obsSnap.exists() ? obsSnap.data().observations : [];
  
      return { plantData, observations };
    } catch (error) {
      console.error('getPlantInfo error:', error);
      throw error;
    }
  }
}

export const plantService = new PlantService();
