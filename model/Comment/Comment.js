const mongoose = require("mongoose");

//create Schema
const commentSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: [true, "Comment description is required"],
    },
    user: {
      type: Object,
      required: [true, "User is required"],
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: [true, "Post is required"],
    },
  },
  {
    timestamps: true,
  }
);

//Compile the Comment model
const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;
