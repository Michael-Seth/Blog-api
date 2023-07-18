const mongoose = require("mongoose");
const Post = require("../Post/Post");

//Create Schema
const userSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: [true, "First Name is required"],
    },
    lastname: {
      type: String,
      required: [true, "Last Name is required"],
    },
    profilePhoto: {
      type: String,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ["Admin", "Guest", "Editor"],
    },
    viewers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    blocked: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // plan: {
    //   type: String,
    //   enum: ["Free", "Premium", "Pro"],
    //   default: "Free",
    // },
    userAward: {
      type: String,
      enum: ["Bronze", "Silver", "Gold"],
      default: "Bronze",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

//Hooks
//Pre - before record is saved
userSchema.pre("findOne", async function (next) {
  this.populate({
    path: "posts",
  });
  //Get the user id
  const userId = this._conditions._id;
  const allPosts = await Post.find({ user: userId });
  const lastPost = await allPosts[allPosts.length - 1];
  const lastPostDate = new Date(lastPost?.createdAt);
  const lastPostDateStr = lastPostDate.toDateString();
  //Get Followers count
  userSchema.virtual("lastPostDateStr").get(function () {
    return lastPostDateStr;
  });

  //--------------------- Check if a user is inActive ---------------------------
  //Get current date
  const currentDate = new Date();

  //Subtract them to get the difference
  const diff = currentDate - lastPostDate;

  //Convert the tiimeStamp to days
  const diffInDays = diff / (1000 * 3600 * 24);

  if (diffInDays > 30) {
    userSchema.virtual("isInActive").get(function () {
      return true;
    });
    //Find the user Id
    await User.findByIdAndUpdate(
      userId,
      {
        isBlocked: true,
      },
      {
        new: true,
      }
    );
  } else {
    userSchema.virtual("isInActive").get(function () {
      return false;
    });
    //Find the user Id
    await User.findByIdAndUpdate(
      userId,
      {
        isBlocked: false,
      },
      {
        new: true,
      }
    );
  }

  //--------------- Last Active Date ------------------
  const daysAgo = Math.floor(diffInDays);
  userSchema.virtual("lastActive").get(function () {
    if (daysAgo <= 0) {
      return "Today";
    }
    if (daysAgo === 1) {
      return "Yesterday";
    }
    if (daysAgo > 1) {
      return `${daysAgo} days ago`;
    }
  });

  //--------------- Update User Award Field Based On Number of Posts ------------------
  const numberOfPosts = allPosts.length;
  if (numberOfPosts < 10) {
    await User.findByIdAndUpdate(
      userId,
      {
        userAward: "Bronze",
      },
      {
        new: true,
      }
    );
  }
  if (numberOfPosts > 10) {
    await User.findByIdAndUpdate(
      userId,
      {
        userAward: "Silver",
      },
      {
        new: true,
      }
    );
  }
  if (numberOfPosts > 20) {
    await User.findByIdAndUpdate(
      userId,
      {
        userAward: "Gold",
      },
      {
        new: true,
      }
    );
  }

  next();
});

//Post - after record is saved
// userSchema.post("save", function (next) {
//   next();
// });

//Get fullName
userSchema.virtual("fullname").get(function () {
  return `${this.firstname} ${this.lastname}`;
});

//Get user initials
userSchema.virtual("initials").get(function () {
  return `${this.firstname[0]}${this.lastname[0]}`;
});

//Get post count
userSchema.virtual("postCount").get(function () {
  return this.posts.length;
});

//Get Followers count
userSchema.virtual("followersCount").get(function () {
  return this.followers.length;
});

//Get Followers count
userSchema.virtual("followingsCount").get(function () {
  return this.following.length;
});

//Get Viewers count
userSchema.virtual("viewersCount").get(function () {
  return this.viewers.length;
});

//Get Followers count
userSchema.virtual("blockedCount").get(function () {
  return this.blocked.length;
});

//Compile the user model
const User = mongoose.model("User", userSchema);

module.exports = User;
