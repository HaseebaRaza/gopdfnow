const validator = require("validator");
const Waitlist = require("../models/Waitlist");

exports.addToWaitlist = async (req, res) => {
  try {
    const { email, source } = req.body;

    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address."
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existing = await Waitlist.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(200).json({
        success: true,
        message: "This email is already on the waitlist."
      });
    }

    await Waitlist.create({
      email: normalizedEmail,
      source: source || "general"
    });

    return res.status(201).json({
      success: true,
      message: "Added to waitlist successfully."
    });
  } catch (error) {
    console.error("Waitlist error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Could not save email right now."
    });
  }
};