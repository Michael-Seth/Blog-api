const Comment = require("../../model/Comment/Comment");
const Post = require("../../model/Post/Post");
const User = require("../../model/User/User");
const { errFunc } = require("../../utils/errFunc");

//POST      /
const createCommentCtrl = async (req, res, next) => {
  const { description } = req.body;
  try {
    //Find the post
    const post = await Post.findById(req.params.id);

    //Find the user that gave the comment
    const user = await User.findById(req.userAuth);

    //Create a comment
    const comment = await Comment.create({
      post: post._id,
      description,
      user: req.userAuth,
    });
    //Push the comment to post data
    post.comments.push(comment);

    //Push the comment to user data
    user.comments.push(comment);

    //Save
    await post.save();
    await user.save();

    res.json({
      status: "success",
      data: comment,
    });
  } catch (error) {
    next(errFunc(error.message));
  }
};

//GET      //:id
const singleCommentCtrl = async (req, res) => {
  try {
    res.json({
      status: "success",
      data: "Single comment route",
    });
  } catch (error) {
    res.json(error.message);
  }
};

//DELETE      /:id
const deleteCommentCtrl = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);

    //Check if the Comment belongs to the creator
    if (comment.user.toString() !== req.userAuth.toString()) {
      return next(errFunc("You are not allowed to edit this comment", 403));
    }

    await Comment.findByIdAndDelete(req.params.id);

    res.json({
      status: "success",
      data: "You have successfully deleted this comment",
    });
  } catch (error) {
    next(errFunc(error.message));
  }
};

//PUT      /:id
const updateCommentCtrl = async (req, res, next) => {
  const { description } = req.body;
  try {
    const comment = await Comment.findById(req.params.id);

    //Check if the Comment belongs to the creator
    if (comment.user.toString() !== req.userAuth.toString()) {
      return next(errFunc("You are not allowed to edit this comment", 403));
    }

    await Comment.findByIdAndUpdate(
      req.params.id,
      { description },
      { new: true, runValidators: true }
    );

    res.json({
      status: "success",
      data: comment,
    });
  } catch (error) {
    next(errFunc(error.message));
  }
};

module.exports = {
  createCommentCtrl,
  singleCommentCtrl,
  deleteCommentCtrl,
  updateCommentCtrl,
};
