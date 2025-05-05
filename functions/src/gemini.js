const {onCall} = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const {defineSecret} = require("firebase-functions/params");

// Initialize Firebase Admin
admin.initializeApp();

// Define the secret
const geminiKey = defineSecret("GEMINI_KEY");

const BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const MODEL = "gemini-1.5-flash";

exports.askPlantQuestion = onCall({
  region: "europe-west2",
  cors: true,
  memory: "256MiB",
  timeoutSeconds: 60,
  secrets: [geminiKey],
}, async (request) => {
  // Verify the user is authenticated
  if (!request.auth) {
    throw new Error("The function must be called while authenticated.");
  }

  const {plantName, userPrompt, history = []} = request.data;

  // Validate input
  if (!plantName || !userPrompt) {
    throw new Error("plantName and userPrompt are required");
  }

  const ENDPOINT = `${BASE}/${MODEL}:generateContent?key=${geminiKey.value()}`;

  const contents = history.map((h) => ({
    role: h.role,
    parts: [{text: h.content}],
  }));

  contents.push({
    role: "user",
    parts: [{text: `Plant: ${plantName}\nQuestion: ${userPrompt}`}],
  });

  try {
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({contents}),
    });

    if (!response.ok) {
      const errorJson = await response.json();
      console.error("Gemini error", errorJson);
      const errorMessage = errorJson.error && errorJson.error.message;
      throw new Error(errorMessage || "Gemini request failed");
    }

    const data = await response.json();
    const candidates = data.candidates || [];
    const firstCandidate = candidates[0] || {};
    const content = firstCandidate.content || {};
    const parts = content.parts || [];
    const firstPart = parts[0] || {};

    return {
      text: firstPart.text || "No answer returned.",
    };
  } catch (error) {
    console.error("Error calling Gemini:", error);
    throw new Error("Failed to get response from Gemini");
  }
});
