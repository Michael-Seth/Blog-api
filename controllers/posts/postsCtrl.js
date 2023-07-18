const Post = require("../../model/Post/Post");
const User = require("../../model/User/User");
const { errFunc } = require("../../utils/errFunc");

//POST      /
const createPostsCtrl = async (req, res, next) => {
  const { title, description, category } = req.body;
  try {
    //Find the user
    const author = await User.findById(req.userAuth);
    if (author.isBlocked) {
      return next(errFunc("Access Denied, Account Blocked", 403));
    }
    //create the post
    const postCreated = await Post.create({
      title,
      description,
      user: author._id,
      category,
      photo: req?.file?.path,
    });
    // Associate User to a post: Push the post into the posts array in the user model
    author.posts.push(postCreated);

    //save
    await author.save();
    res.json({
      status: "success",
      data: postCreated,
    });
  } catch (error) {
    next(errFunc(error.message));
  }
};

//GET      //:id
const togglePostLikesCtrl = async (req, res, next) => {
  try {
    //Get the post
    const post = await Post.findById(req.params.id);

    //Check if the user already liked the post
    const isLiked = post.likes.includes(req.userAuth);
    //const isDisLiked = post.disLikes.includes(req.userAuth);

    //if the user has already liked the post, unlike it
    if (isLiked) {
      post.likes = post.likes.filter(
        (like) => like.toString() !== req.userAuth.toString()
      );
      // post.disLikes = post.disLikes.filter(
      //   (disLike) => disLike.toString() !== req.userAuth.toString()
      // );
      await post.save();
    } else {
      //If the user has not liked the post, Like it
      post.likes.push(req.userAuth);
      await post.save();
    }

    res.json({
      status: "success",
      data: "You have successfully liked the post",
    });
  } catch (error) {
    next(errFunc(error.message));
  }
};

//GET      //:id
const togglePostDislikesCtrl = async (req, res, next) => {
  try {
    //Get the post
    const post = await Post.findById(req.params.id);

    //Check if the user already Disliked the post
    const isDisliked = post.disLikes.includes(req.userAuth);

    //if the user has already liked the post, unlike it
    if (isDisliked) {
      post.disLikes = post.disLikes.filter(
        (disLike) => disLike.toString() !== req.userAuth.toString()
      );
      await post.save();
    } else {
      //If the user has not liked the post, Like it
      post.disLikes.push(req.userAuth);
      await post.save();
    }

    res.json({
      status: "success",
      data: "You have successfully disliked the post",
    });
  } catch (error) {
    next(errFunc(error.message));
  }
};

//GET      //:id
const singlePostCtrl = async (req, res, next) => {
  try {
    //Find the post
    const post = await Post.findById(req.params.id);

    const isViewed = post.numViews.includes(req.userAuth);

    if (isViewed) {
      res.json({
        status: "success",
        data: post,
      });
    } else {
      post.numViews.push(req.userAuth);
      res.json({
        status: "success",
        data: post,
      });
      await post.save();
    }
  } catch (error) {
    next(errFunc(error.message));
  }
};

//GET /
const allPostCtrl = async (req, res, next) => {
  try {
    //Find all posts
    const allPosts = await Post.find({})
      .populate("user")
      .populate("category", "title");

    //Check if the user viewing is blocked by the owner of the post
    const filteredPosts = allPosts.filter((posts) => {
      //Get all blocked users
      const blockedUsers = posts.user.blocked;
      const isBlocked = blockedUsers.includes(req.userAuth);

      return isBlocked ? null : posts; // !isBlocked
    });

    res.json({
      status: "success",
      data: filteredPosts,
    });
  } catch (error) {
    next(errFunc(error.message));
  }
};

//DELETE      //:id
const deletePostCtrl = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.user.toString() !== req.userAuth.toString()) {
      return next(errFunc("You are not allowed to deleted this post", 403));
    }
    await Post.findByIdAndDelete(req.params.id);
    res.json({
      status: "success",
      data: "You have deleted this post",
    });
  } catch (error) {
    next(errFunc(error.message));
  }
};

//PUT      //:id
const updatePostCtrl = async (req, res, next) => {
  const { title, description, category } = req.body;
  try {
    const post = await Post.findById(req.params.id);

    //Check if the post belong to the user
    if (post.user.toString() !== req.userAuth.toString()) {
      return next(errFunc("You are not allowed to edit this post", 403));
    }
    await Post.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        category,
        photo: req?.file?.path,
      },
      {
        new: true,
      }
    );
    res.json({
      status: "success",
      data: post,
    });
  } catch (error) {
    next(errFunc(error.message));
  }
};

module.exports = {
  createPostsCtrl,
  singlePostCtrl,
  allPostCtrl,
  deletePostCtrl,
  updatePostCtrl,
  togglePostLikesCtrl,
  togglePostDislikesCtrl,
};
