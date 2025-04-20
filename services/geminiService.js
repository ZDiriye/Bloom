import Constants from 'expo-constants';

const KEY   = Constants.expoConfig.extra.GOOGLE_GEMINI_API_KEY;
const BASE  = 'https://generativelanguage.googleapis.com/v1beta/models';
const MODEL = 'gemini-1.5-flash';
const ENDPOINT = `${BASE}/${MODEL}:generateContent?key=${KEY}`;

export async function askPlantQuestion(plantName, userPrompt, history = []) {
  const contents = history.map(h => ({
    role: h.role,
    parts: [{ text: h.content }],
  }));
  contents.push({
    role: 'user',
    parts: [{ text: `Plant: ${plantName}\nQuestion: ${userPrompt}` }],
  });

  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents }),
  });

  if (!response.ok) {
    const errorJson = await response.json();
    console.error('Gemini error', errorJson);
    throw new Error(errorJson.error?.message || 'Gemini request failed');
  }

  const data = await response.json();
  return (
    data.candidates?.[0]?.content?.parts?.[0]?.text ||
    'No answer returned.'
  );
}