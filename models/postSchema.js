const mongoose = require("mongoose");

const schema = mongoose.Schema;

postSchema = schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    createdBy: {
      type: String,
      required: true,
    },
    likes: {
      type: Number,
    },
    image: {
      type: String,
      required: true,
    },
    approved: Boolean,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);
