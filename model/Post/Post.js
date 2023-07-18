const mongoose = require("mongoose");

//create Schema
const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Post title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Post description is required"],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Post category is required"],
    },
    numViews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    disLikes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please Author is required"],
    },
    photo: {
      type: String,
      required: [true, "Post Image is required"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

postSchema.pre(/^find/, async function (next) {
  postSchema.virtual("viewsCount").get(function () {
    const post = this;
    return post.numViews.length;
  });

  postSchema.virtual("likesCount").get(function () {
    const post = this;
    return post.likes.length;
  });

  postSchema.virtual("disLikeCount").get(function () {
    const post = this;
    return post.disLikes.length;
  });

  postSchema.virtual("likesPercentage").get(function () {
    const post = this;
    const total = +post.likes.length + +post.disLikes.length;
    // Check if the total is zero
    if (total === 0) {
      return "No ratings yet";
    }
    const percentage = (post.likes.length / total) * 100;
    return `${percentage}%`;
  });

  postSchema.virtual("disLikesPercentage").get(function () {
    const post = this;
    const total = +post.disLikes.length + +post.likes.length;
    // Check if the total is zero
    if (total === 0) {
      return "No ratings yet";
    }
    const percentage = (post.disLikes.length / total) * 100;
    return `${percentage}%`;
  });

  postSchema.virtual("daysAgo").get(function () {
    const post = this;
    const date = new Date(post.createdAt);
    const daysAgo = Math.floor((Date.now() - date) / 86400000);

    return daysAgo === 0
      ? "Today"
      : daysAgo === 1
      ? "Yesterday"
      : `${daysAgo} days ago`;
  });
  next();
});
//Compile the Post model
const Post = mongoose.model("Post", postSchema);

module.exports = Post;
