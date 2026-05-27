// 1. Import all necessary modules
const { client } = require("../config/googleai"); 
const { buildTravelPrompt } = require("../prompts/travelprompt");
const { getHotelsFromDB } = require("./ragservice");
const { getUserHistory, saveChat } = require("./memoryservice");
const { getCache, setCache } = require("./cacheservice");
const { client: redisClient, connectRedis } = require("../config/redisclient");
const crypto = require("crypto"); 

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * STEP 0: INTENT EXTRACTION (The Brain)
 * Converts messy user text into structured JSON data.
 */
const extractIntentFromText = async (text) => {
  const extractionPrompt = `
    Extract travel intent from this user message: "${text}"
    Return ONLY valid JSON.
    
    Look for:
    1. hotelName: The specific name of a hotel (e.g., "Residency", "Taj", "Hilton").
    2. location: The city name.
    3. budget: A number.
    4. intent: "SEARCH" | "CONFIRM_BOOKING" | "INFO" | "CANCEL_BOOKING".

    Format: { "hotelName": "name or null", "location": "city or null", "budget": number or null, "intent": "intent" }

    Examples:
    "Book the Residency in Hyderabad" -> {"hotelName": "Residency", "location": "Hyderabad", "budget": null, "intent": "CONFIRM_BOOKING"}
    "Find hotels in Goa" -> {"hotelName": null, "location": "Goa", "budget": null, "intent": "SEARCH"}
  `;

  try {
    const completion = await client.chat.completions.create({
      model: "openai/gpt-3.5-turbo",
      messages: [{ role: "user", content: extractionPrompt }],
      response_format: { type: "json_object" }
    });

    return JSON.parse(completion.choices[0].message.content);
  } catch (err) {
    console.error("❌ Intent Extraction Failed:", err.message);
    return { hotelName: null, location: null, budget: null, intent: "SEARCH" };
  }
};
/**
 * Core AI Service Function
 */
const generateTravelAI = async ({ userId, userInput, location, budget }) => {
  
  // ---------------------------------------------------------
  // STEP 1: INTENT EXTRACTION (Now extracting Hotel Name!)
  // ---------------------------------------------------------
  console.log(`🧠 Extracting intent from: "${userInput}"`);
  const extracted = await extractIntentFromText(userInput);
  
  // Use extracted values. We now have 'extracted.hotelName'!
  const finalLocation = extracted.location || location || "";
  const finalBudget = extracted.budget || budget || 999999;
  const finalHotelName = extracted.hotelName || null;

  // ---------------------------------------------------------
  // STEP 2: REDIS CACHE CHECK (Key must now include hotelName)
  // ---------------------------------------------------------
  const inputSignature = `${userInput}|${finalLocation}|${finalBudget}|${finalHotelName}`;
  const cacheKey = `ai_cache:${crypto.createHash('sha256').update(inputSignature).digest('hex')}`;

  try {
    await connectRedis();
    const cachedAIResponse = await redisClient.get(cacheKey);
    if (cachedAIResponse) return cachedAIResponse;
  } catch (err) { console.error("Redis Error:", err.message); }

  // ---------------------------------------------------------
  // STEP 3: RAG (Retrieval-Augmented Generation)
  // ---------------------------------------------------------
  // CRITICAL: We now pass finalHotelName to the DB search
  const rawHotels = await getHotelsFromDB({ 
    location: finalLocation, 
    budget: finalBudget,
    hotelName: finalHotelName // This will now catch "Residency"
  });

  console.log(`🔍 RAG: Using Location='${finalLocation}', Hotel='${finalHotelName}', Budget=${finalBudget}, Found=${rawHotels.length}`);

  const lightweightHotels = rawHotels.map(h => ({
    name: h.hotelName,
    city: h.city,
    price: h.pricePerNight,
    rating: h.rating,
    address: h.address
  }));

  // ---------------------------------------------------------
  // STEP 4-6: MEMORY, PROMPT, AND LLM CALL
  // ---------------------------------------------------------
  const fullHistory = await getUserHistory(userId);
  const recentHistory = fullHistory.slice(-10);
  const prompt = buildTravelPrompt({ userInput, hotels: lightweightHotels });

  let responseText = "";
  try {
    const completion = await client.chat.completions.create({
      model: "openai/gpt-3.5-turbo", 
      messages: [
        ...recentHistory.map(msg => ({
          role: msg.role === "assistant" ? "assistant" : "user",
          content: msg.content,
        })),
        { role: "user", content: prompt },
      ],
    });
    responseText = completion.choices[0].message.content;
  } catch (err) {
    console.error("LLM Error:", err);
    throw err;
  }

  // ---------------------------------------------------------
  // STEP 7: CLEANING & PERSISTENCE
  // ---------------------------------------------------------
  let cleanJson = responseText.replace(/```json|```/g, "").trim();

  // Save for Memory and Cache...
  const updatedHistory = [...fullHistory, { role: "user", content: userInput }, { role: "assistant", content: cleanJson }];
  await saveChat(userId, updatedHistory);
  await redisClient.setEx(cacheKey, 86400, cleanJson);

  return cleanJson;
};

module.exports = { generateTravelAI, extractIntentFromText };