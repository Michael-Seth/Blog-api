const mongoose = require("mongoose");

//create Schema
const categorySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

//Compile the Category model
const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
