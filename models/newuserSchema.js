const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const schema = mongoose.Schema;

const newUserSchema = schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    profileImage: {
      type: String,
      required: true,
    },
    bio : {
      type: String,
      required: false,
    }
  },
  { timestamps: true }
);


module.exports = mongoose.model("User", newUserSchema);
