import { getFunctions, httpsCallable, connectFunctionsEmulator } from 'firebase/functions';

export async function askPlantQuestion(plantName, userPrompt, history = []) {
  const functions = getFunctions(undefined, 'europe-west2');
  const askPlantQuestionFn = httpsCallable(functions, 'askPlantQuestion');
  
  try {
    const result = await askPlantQuestionFn({
      plantName,
      userPrompt,
      history
    });
    
    return result.data.text;
  } catch (error) {
    console.error('Error calling askPlantQuestion function:', error);
    throw error;
  }
}