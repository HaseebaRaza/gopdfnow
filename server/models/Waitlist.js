const mongoose = require("mongoose");

const waitlistSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    source: {
      type: String,
      default: "general"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Waitlist", waitlistSchema);