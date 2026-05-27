const Chat = require("../models/chat");

const getUserHistory = async (userId) => {
  const chat = await Chat.findOne({ userId });
  return chat?.messages || [];
};

const saveChat = async (userId, messages) => {
  await Chat.updateOne(
    { userId },
    { $set: { messages } },
    { upsert: true }
  );
};

module.exports = { getUserHistory, saveChat };