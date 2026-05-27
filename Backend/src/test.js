const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI("PASTE_YOUR_NEW_API_KEY");

async function run() {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    const result = await model.generateContent("Hello");
    console.log(result.response.text());

  } catch (err) {
    console.error(err);
  }
}

run();