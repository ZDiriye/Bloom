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

  async getPlantInfo(observationId) {
    if (!observationId) throw new Error('observation id required');

    const obsRef = doc(db, 'observations', observationId);
    const obsSnap = await getDoc(obsRef);
    if (!obsSnap.exists()) throw new Error('observation not found');

    const { plantId, probability } = obsSnap.data();
    if (!plantId) throw new Error('no plantId in observation');

    const plantRef = doc(db, 'plants', plantId.toString());
    const plantSnap = await getDoc(plantRef);
    if (!plantSnap.exists()) throw new Error('plant not found');

    /* gather up to 50 other observations for the same plant */
    const q = query(
      collection(db, 'observations'),
      where('plantId', '==', plantId),
      limit(50)
    );
    const other = await getDocs(q);
    const observations = other.docs.flatMap(d =>
      (d.data().observations ?? []).filter((o) => o.location)
    );

    return { plantData: plantSnap.data(), observations, probability };
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

export async function getUserProfileData(userId) {
  if (!userId) throw new Error('userId required');

  // 1. pull all observations for the user
  let observations = [];
  try {
    const obsQ = query(
      collection(db, 'observations'),
      where('userId', '==', userId)
    );
    const obsSnap = await getDocs(obsQ);
    observations = obsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error('Error fetching observations:', error);
    throw error;
  }

  const totalIdentifications = observations.length;

  // 2. find rarest plant among those observations
  let rarestPlant = null;
  let rarestCount = Infinity;

  // Get all unique plant IDs from observations
  const uniquePlantIds = [...new Set(observations.map(obs => obs.plantId))];
  
  // Fetch all plants and find the rarest one
  for (const plantId of uniquePlantIds) {
    const plantRef = doc(db, 'plants', plantId.toString());
    const plantSnap = await getDoc(plantRef);
    if (!plantSnap.exists()) continue;

    const plant = plantSnap.data();
    const count = plant.observationsCount ?? 0;

    if (count < rarestCount) {
      rarestCount = count;
      rarestPlant = {
        id: plant.id,
        name: plant.name,
        commonName: plant.commonName,
        observationsCount: count,
        photo: plant.defaultPhoto
      };
    }
  }

  // 3. find most recent observation
  let mostRecentObservation = null;
  try {
    // First try with the composite index
    const recentObsQ = query(
      collection(db, 'observations'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(1)
    );
    const recentObsSnap = await getDocs(recentObsQ);
    mostRecentObservation = recentObsSnap.docs[0]?.data() || null;
  } catch (error) {
    console.warn('Error fetching most recent observation with index:', error);
    // Fallback to finding most recent manually
    mostRecentObservation = observations.reduce((latest, current) => {
      if (!latest || !latest.createdAt) return current;
      if (!current.createdAt) return latest;
      return current.createdAt.toDate().getTime() > latest.createdAt.toDate().getTime() ? current : latest;
    }, null);
  }

  // 4. pull user document for name, xp, photo
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) {
    throw new Error('User not found');
  }

  const userData = userSnap.data();
  
  // 5. Get plant data for most recent observation if it exists
  let mostRecentPlant = null;
  if (mostRecentObservation && mostRecentObservation.plantId) {
    const plantRef = doc(db, 'plants', mostRecentObservation.plantId.toString());
    const plantSnap = await getDoc(plantRef);
    if (plantSnap.exists()) {
      const plant = plantSnap.data();
      mostRecentPlant = {
        id: plant.id,
        name: plant.name,
        commonName: plant.commonName,
        photo: plant.defaultPhoto,
        timestamp: mostRecentObservation.createdAt
      };
    }
  }
  
  return {
    user: {
      displayName: userData.displayName || 'Anonymous',
      xp: userData.xp || 0,
      photoURL: userData.photoURL || userData.profilePic || null
    },
    totalIdentifications,
    rarestPlant,
    mostRecentPlant
  };
}

export const plantService = new PlantService();

