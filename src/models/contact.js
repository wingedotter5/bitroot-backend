const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phones: {
    type: [String],
    validate: {
      validator(value) {
        return new Set(value).size === value.length;
      },
      message: "phone number must be unique",
    },
  },
  avatar_url: String,
});

module.exports = mongoose.model("Contact", contactSchema);
