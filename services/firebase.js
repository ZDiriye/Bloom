import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyDgDBh89PlNAMukbxADnOvNvi49lW7EHTU",
  authDomain: "bloom-a0a2b.firebaseapp.com",
  projectId: "bloom-a0a2b",
  storageBucket: "bloom-a0a2b.firebasestorage.app",
  messagingSenderId: "421481885898",
  appId: "1:421481885898:web:d550b62eb8524a6f914433",
  measurementId: "G-G41EYHPYNF"
};

const app = initializeApp(firebaseConfig);

// Initialize auth with AsyncStorage persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export const db = getFirestore(app);

export const savePlantIdentification = async (userId, plantData, observations) => {
  try {
    const identificationsRef = collection(db, 'users', userId, 'identifications');
    
    // Filter observations to essential data
    const filteredObservations = observations.map(obs => ({
      id: obs.id,
      coordinates: obs.geojson?.coordinates || [],
      observed_on: obs.observed_on,
      photo_url: obs.photos?.[0]?.url || null,
      quality_grade: obs.quality_grade
    }));

    await addDoc(identificationsRef, {
      plantData: {
        id: plantData.id,
        commonName: plantData.preferred_common_name,
        scientificName: plantData.name,
        description: plantData.wikipedia_summary,
        photoUrl: plantData.default_photo?.medium_url,
        taxonomy: plantData.ancestors
      },
      observations: filteredObservations,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error("Error saving identification:", error);
    throw error;
  }
};

const fetchUserIdentifications = async (userId) => {
  const q = query(
    collection(db, 'users', userId, 'identifications'),
    orderBy('timestamp', 'desc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};