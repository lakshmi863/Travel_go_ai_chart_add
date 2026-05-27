// models/Chat.js
const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "assistant", "system"],
      required: true,
    },

    content: {
      type: String,
      required: true,
    },

    tokens: {
      type: Number,
      default: 0,
    },

    metadata: {
      type: Object,
      default: {},
    },
  },
  { _id: false }
);

const chatSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    sessionId: {
      type: String,
      index: true,
    },

    messages: [messageSchema],

    summary: {
      type: String, // AI-generated memory summary (important for long chats)
      default: "",
    },
  },
  { timestamps: true }
);

// Index for fast retrieval (important for AI apps)
chatSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("Chat", chatSchema);