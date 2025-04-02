import { db } from './firebase';
import { fetchPlantDataBasic, fetchPlantDetails, fetchPlantObservations } from './api/inaturalist';
import { 
  doc,
  getDoc,
  collection,
  query,
  getDocs,
  orderBy,
  limit
} from 'firebase/firestore';
import { savePlantIdentification } from './plantStorage';

class PlantService {
  async fetchPlantAndSave(plantName, userId) {
    try {
      const basicData = await fetchPlantDataBasic(plantName);
      if (!basicData) throw new Error('Plant not found');
      const plantId = basicData.id;

      const existingData = await this.getPlantInfo(userId, plantId);
      if (existingData) {
        return existingData;
      }

      const detailedData = await fetchPlantDetails(plantId);
      const obsData = await fetchPlantObservations(plantId);
      const observations = obsData?.results || [];

      const plantData = detailedData;
      await savePlantIdentification(userId, plantData, observations);

      return await this.getPlantInfo(userId, plantId);
    } catch (error) {
      console.error('fetchPlantAndSave error:', error);
      throw error;
    }
  }
  
  async getPlantInfo(userId, plantId) {
    try {
      const plantRef = doc(db, 'plants', plantId.toString());
      const plantSnap = await getDoc(plantRef);
      if (!plantSnap.exists()) return null;
      const plantData = plantSnap.data();

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

  async getRecentIdentifications() {
    try {
      const observationsQuery = query(
        collection(db, 'observations'),
        orderBy('createdAt', 'desc'),
        limit(10)
      );
      const snapshot = await getDocs(observationsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('getRecentIdentifications error:', error);
      throw error;
    }
  }

  async getFullObservations() {
    try {
      const observations = await this.getRecentIdentifications();
      const fullObservations = await Promise.all(
        observations.map(async (obs) => {
          if (!obs.plantId || !obs.userId) {
            console.warn(`Observation ${obs.id} missing plantId or userId`);
            return { ...obs, plantData: null, userData: null };
          }

          const plantRef = doc(db, 'plants', obs.plantId.toString());
          const userRef = doc(db, 'users', obs.userId);

          const plantDoc = await getDoc(plantRef);
          const userDoc = await getDoc(userRef);

          return {
            ...obs,
            plantData: plantDoc.exists() ? plantDoc.data() : null,
            userData: userDoc.exists() ? userDoc.data() : null,
          };
        })
      );
      return fullObservations;
    } catch (error) {
      console.error('getFullObservations error:', error);
      throw error;
    }
  }
}

export const plantService = new PlantService();
