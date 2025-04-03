import { db } from './firebase';
import { fetchPlantDataBasic, fetchPlantDetails, fetchPlantObservations } from './api/inaturalist';
import { 
  doc,
  getDoc,
  collection,
  query,
  getDocs,
  orderBy,
  limit,
  setDoc,
  where
} from 'firebase/firestore';
import { savePlantIdentification } from './plantStorage';
import { auth } from './firebase';

class PlantService {
  async fetchPlantAndSave(plantName, userId) {
    if (!plantName || !userId) {
      throw new Error('Plant name and user ID are required');
    }

    try {
      const basicData = await fetchPlantDataBasic(plantName);
      if (!basicData) {
        throw new Error(`No plant found with name: ${plantName}`);
      }
      const plantId = basicData.id;

      // Try to get existing data first
      const existingData = await this.getPlantInfo(userId, plantId);
      if (existingData) {
        return existingData;
      }

      // Fetch new data
      const [detailedData, obsData] = await Promise.all([
        fetchPlantDetails(plantId),
        fetchPlantObservations(plantId)
      ]);

      if (!detailedData) {
        throw new Error('Failed to fetch plant details');
      }
      
      await this.updateUserXP(userId, detailedData.observations_count);

      const observations = obsData?.results || [];
      await savePlantIdentification(userId, detailedData, observations);

      // Fetch the saved data to ensure consistency
      const savedData = await this.getPlantInfo(userId, plantId);
      if (!savedData) {
        throw new Error('Failed to save plant data');
      }

      return savedData;
    } catch (error) {
      console.error('fetchPlantAndSave error:', error);
      throw error;
    }
  }
  
  async getPlantInfo(userId, plantId) {
    if (!userId || !plantId) {
      throw new Error('User ID and plant ID are required');
    }

    try {
      const plantRef = doc(db, 'plants', plantId.toString());
      const plantSnap = await getDoc(plantRef);
      if (!plantSnap.exists()) {
        return null;
      }
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
  // recent scans on the identification screen
  async getRecentScans(limitCount = 5) {
    try {
      if (!auth.currentUser) {
        throw new Error('User must be authenticated to get recent scans');
      }
  
      const userId = auth.currentUser.uid;
      const observationsQuery = query(
        collection(db, 'observations'),
        orderBy('createdAt', 'desc'),
        limit(limitCount) 
      );
  
      const snapshot = await getDocs(observationsQuery);
      const userScans = snapshot.docs
        .filter(doc => doc.data().userId === userId)
        .map(doc => ({
          id: doc.id,
          createdAt: doc.data().createdAt,
          ...doc.data()
        }));
  
      const scansWithPlantData = await Promise.all(
        userScans.map(async (scan) => {
          if (!scan.plantId) {
            console.warn(`Scan ${scan.id} missing plantId`);
            return { ...scan, plantData: null };
          }
          const plantRef = doc(db, 'plants', scan.plantId.toString());
          const plantDoc = await getDoc(plantRef);
          return {
            ...scan,
            plantData: plantDoc.exists() ? plantDoc.data() : null,
          };
        })
      );
  
      return scansWithPlantData;
    } catch (error) {
      console.error('getRecentScans error:', error);
      throw error;
    }
  }

  async updateUserXP(userId, observationsCount) {
    let xpReward = 0;
    if (observationsCount < 50000) {
      xpReward = 100;
    } else if (observationsCount < 150000) {
      xpReward = 50;
    } else {
      xpReward = 20;
    }
    
    // Fetch current xp (assuming you store xp in the user's document)
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    const currentXP = userSnap.exists() ? userSnap.data().xp || 0 : 0;
    
    // Update the user's xp field
    await setDoc(userRef, { xp: currentXP + xpReward }, { merge: true });
  }

  async getTopUsersByXP(limitCount = 10) {
    try {
      const usersQuery = query(
        collection(db, 'users'),
        orderBy('xp', 'desc'),
        limit(limitCount)
      );
      
      const snapshot = await getDocs(usersQuery);
      return snapshot.docs.map(doc => ({
        userId: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('getTopUsersByXP error:', error);
      throw error;
    }
  }
}

export const plantService = new PlantService();
