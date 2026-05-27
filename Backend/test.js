require("dotenv").config();

const OpenAI = require("openai");

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

async function run() {
  try {

    const completion = await client.chat.completions.create({
      model: "openai/gpt-oss-120b:free",
      messages: [
        {
          role: "user",
          content: "Hello",
        },
      ],
    });

    console.log(completion.choices[0].message.content);

  } catch (err) {
    console.error(err);
  }
}

run();