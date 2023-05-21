const mongoose = require("mongoose");

const schema = mongoose.Schema;

sponsorshipSchema = schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    location: {
      type: Array,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    approved: { type: Boolean },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Sponsorship", sponsorshipSchema);
