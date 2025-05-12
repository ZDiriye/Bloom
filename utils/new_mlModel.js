const SERVER_URL = 'http://172.20.10.6:5000'; // change 172.20.10.6 to your network IP address to run the server on your local machine

export async function predictImage(imageUri) {
    let formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      name: 'photo.jpg',
      type: 'image/jpeg',
    });
  
    try {
      // Add a timeout to the fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
  
      const response = await fetch(`${SERVER_URL}/predict`, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });
  
      clearTimeout(timeoutId);
  
      if (!response.ok) {
        const text = await response.text();
        console.error('Server error response:', text);
        throw new Error(`Server returned ${response.status}: ${text}`);
      }
  
      const json = await response.json();
      
      // Validate the response
      if (!json || typeof json.plant_id !== 'string' || typeof json.probability !== 'number') {
        throw new Error('Invalid response from server');
      }
      
      return json;
    } catch (error) {
      console.error('Error in predictImage:', error);
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. Please try again.');
      }
      if (error.message.includes('Network request failed')) {
        throw new Error('Could not connect to the server. Please check your internet connection.');
      }
      throw error;
    }
  }
  