const { generateTravelAI, extractIntentFromText } = require("../services/aiservice");

const travelAI = async (req, res) => {
  try {
    const userId = req.user?.id; 
    const userInput = req.body.userInput || req.body.message;
    const { location, budget } = req.body;

    if (!userInput) {
      return res.status(400).json({ 
        success: false, 
        error: "No message detected. Please try typing again." 
      });
    }

    // Now this will work because it is imported!
    const extractedIntent = await extractIntentFromText(userInput);
    
    // Use the extracted info for the real search
    const finalLocation = extractedIntent.location || location || "";
    const finalBudget = extractedIntent.budget || budget || 999999;

    console.log(`🤖 AI processing: Extracted Location: ${finalLocation}, Budget: ${finalBudget}`);

    const aiResponse = await generateTravelAI({ 
      userId, 
      userInput, 
      location: finalLocation, // Use extracted
      budget: finalBudget     // Use extracted
    });

    res.json({
      success: true,
      reply: aiResponse, 
    });

  } catch (error) {
    console.error("❌ AI Controller Critical Error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "The AI is having a hard time thinking right now.",
    });
  }
};

module.exports = { travelAI };