const mongoose = require("mongoose");

const ConversationSchema = new mongoose.Schema({
  participants: {
    type: [String],
    required: true,
    validate: {
      validator: function(arr) {
        return arr.length === 2;
      },
      message: "Conversation must have exactly 2 participants"
    }
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Message"
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Conversation", ConversationSchema);