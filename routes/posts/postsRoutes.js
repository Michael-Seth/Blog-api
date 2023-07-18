const express = require("express");
const {
  createPostsCtrl,
  singlePostCtrl,
  allPostCtrl,
  deletePostCtrl,
  updatePostCtrl,
  togglePostLikesCtrl,
  togglePostDislikesCtrl,
} = require("../../controllers/posts/postsCtrl");
const isLogin = require("../../middlewares/isLogin");
const storage = require("../../config/cloudinary");
const multer = require("multer");
const postsRouter = express.Router();

//Instance of multer
const upload = multer({ storage });

//POST      /
postsRouter.post("/", isLogin, upload.single("postImage"), createPostsCtrl);

//GET      //:id
postsRouter.get("/:id", isLogin, singlePostCtrl);

//GET      //:id
postsRouter.get("/likes/:id", isLogin, togglePostLikesCtrl);

//GET      //:id
postsRouter.get("/dislikes/:id", isLogin, togglePostDislikesCtrl);

//GET /
postsRouter.get("/", isLogin, allPostCtrl);

//DELETE      //:id
postsRouter.delete("/:id", isLogin, deletePostCtrl);

//PUT      //:id
postsRouter.put("/:id", isLogin, upload.single("postImage"), updatePostCtrl);

module.exports = postsRouter;
