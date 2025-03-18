export async function fetchPlantData(plantName) {
  try {
    // First call: search by name
    const response = await fetch(`https://api.inaturalist.org/v1/taxa?q=${plantName}`);
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.status}`);
    }
    const data = await response.json();

    // Check if we got a result
    if (data.results && data.results.length > 0) {
      const plantId = data.results[0].id;
      
      // Second call: get details by ID
      const responseById = await fetch(`https://api.inaturalist.org/v1/taxa/${plantId}`);
      if (!responseById.ok) {
        throw new Error(`Network response was not ok: ${responseById.status}`);
      }
      const detailedData = await responseById.json();
      return detailedData;
    } else {
      return null;
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
}
