// utils/streamResponse.js
const streamAIResponse = async (openai, messages, res) => {
  const stream = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
    stream: true
  });

  for await (const chunk of stream) {
    const text = chunk.choices[0]?.delta?.content;
    if (text) res.write(text);
  }

  res.end();
};

module.exports = { streamAIResponse };