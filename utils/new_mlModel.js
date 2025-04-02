// utils/mlModel.js
export async function predictImage(imageUri) {
    // Create a FormData object and add the image.
    let formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      name: 'photo.jpg', // A simple name for the file
      type: 'image/jpeg'
    });
  
    try {
      // Using the local IP address for the server
      const response = await fetch('http://192.168.1.162:5000/predict', {
        method: 'POST',
        body: formData,
      });
  
      // Check if the response status is OK
      if (!response.ok) {
        const text = await response.text();
        console.error('Server error response:', text);
        throw new Error(`Server returned ${response.status}`);
      }
  
      // Attempt to parse JSON
      const json = await response.json();
      return json.predicted_class;
    } catch (error) {
      console.error('Error in predictImage:', error);
      throw error;
    }
  }
  