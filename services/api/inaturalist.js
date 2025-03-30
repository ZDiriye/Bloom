// Performs a basic search by name to return the first result (which includes the id).
export async function fetchPlantDataBasic(plantName) {
  try {
    const response = await fetch(`https://api.inaturalist.org/v1/taxa?q=${plantName}`);
    if (!response.ok) throw new Error(`Network response was not ok: ${response.status}`);
    const data = await response.json();
    if (data.results && data.results.length > 0) {
      return data.results[0]; // Basic info (including the id)
    }
    return null;
  } catch (error) {
    console.error('fetchPlantDataBasic error:', error);
    throw error;
  }
}

// Using the plant id, get detailed info.
export async function fetchPlantDetails(plantId) {
  try {
    const response = await fetch(`https://api.inaturalist.org/v1/taxa/${plantId}`);
    if (!response.ok) throw new Error(`Network response was not ok: ${response.status}`);
    const detailedData = await response.json();
    // Some responses wrap data in a results array, so extract the first element if present.
    return (detailedData.results && detailedData.results.length > 0)
      ? detailedData.results[0]
      : detailedData;
  } catch (error) {
    console.error('fetchPlantDetails error:', error);
    throw error;
  }
}

export async function fetchPlantObservations(plantId) {
  try {
    const response = await fetch(
      `https://api.inaturalist.org/v1/observations?taxon_id=${plantId}&geo=true&per_page=50`
    );
    if (!response.ok) throw new Error(`Network error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('fetchPlantObservations error:', error);
    throw error;
  }
}
