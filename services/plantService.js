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
  async fetchPlantAndSave(plantName, userId, probability) {
    if (!plantName || !userId) {
      throw new Error('Plant name and user ID are required');
    }

    try {
      const basicData = await fetchPlantDataBasic(plantName);
      if (!basicData) {
        throw new Error('No plant found with this name');
      }
      const plantId = basicData.id;

      // Fetch new data
      const [detailedData, obsData] = await Promise.all([
        fetchPlantDetails(plantId),
        fetchPlantObservations(plantId)
      ]);

      if (!detailedData) {
        throw new Error('Unable to fetch plant details');
      }
      
      await this.updateUserXP(userId, detailedData.observations_count);

      const observations = obsData?.results || [];

      // Format the data once
      const formattedPlantData = {
        id: detailedData.id,
        name: detailedData.name,
        commonName: detailedData.preferred_common_name || '',
        defaultPhoto: detailedData.default_photo?.medium_url || '',
        taxonomy: detailedData.ancestors || [],
        wikipediaSummary: detailedData.wikipedia_summary || '',
        wikipediaUrl: detailedData.wikipedia_url || '',
        extinct: detailedData.extinct || false,
        observationsCount: detailedData.observations_count || 0,
        conservationStatus: detailedData.conservation_status?.status || 'Not Evaluated',
        endemic: detailedData.endemic || false,
        firstObservation: detailedData.first_observation || 'Unknown'
      };

      const formattedObservations = observations.map(obs => ({
        location: obs.geojson?.coordinates || null
      })).filter(obs => obs.location !== null);

      // Save using the formatted data
      const saveResult = await savePlantIdentification(userId, formattedPlantData, formattedObservations, probability);

      // Return the formatted data
      return { 
        plantData: formattedPlantData, 
        observations: saveResult.observations,
        probability: probability,
        observationId: saveResult.newObservationId
      };
    } catch (error) {
      throw new Error(error.message || 'An error occurred while processing the plant data');
    }
  }

  async getPlantInfo(plantName, observationId) {
    if (!plantName || !observationId) {
      throw new Error('Plant name and observation ID are required');
    }

    try {
      // First get the observation to get the correct plantId
      const observationRef = doc(db, 'observations', observationId);
      const observationDoc = await getDoc(observationRef);

      if (!observationDoc.exists()) {
        throw new Error('Observation not found in database');
      }

      const observationData = observationDoc.data();
      const plantId = observationData.plantId;

      if (!plantId) {
        throw new Error('Observation does not have a valid plantId');
      }

      // Get the plant from the database using the plantId
      const plantRef = doc(db, 'plants', plantId.toString());
      const plantDoc = await getDoc(plantRef);

      if (!plantDoc.exists()) {
        throw new Error('Plant not found in database');
      }

      const plantData = plantDoc.data();
      
      // Get observations from the database
      const observationsQuery = query(
        collection(db, 'observations'),
        where('plantId', '==', plantId),
        limit(50)
      );
      const observationsSnapshot = await getDocs(observationsQuery);
      const observations = [];
      let probability = null;
      observationsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        // Get the probability from the first observation document
        if (!probability && data.probability) {
          probability = data.probability;
        }
        if (data.observations && Array.isArray(data.observations)) {
          data.observations.forEach(obs => {
            if (obs.location) {
              observations.push({ location: obs.location });
            }
          });
        }
      });

      return {
        plantData,
        observations,
        probability
      };
    } catch (error) {
      throw new Error(error.message || 'An error occurred while fetching plant data from database');
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
