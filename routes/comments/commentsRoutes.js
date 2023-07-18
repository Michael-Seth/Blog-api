const express = require("express");
const {
  createCommentCtrl,
  singleCommentCtrl,
  deleteCommentCtrl,
  updateCommentCtrl,
} = require("../../controllers/comments/commentsCtrl");
const isLogin = require("../../middlewares/isLogin");
const commentsRouter = express.Router();

//POST      /
commentsRouter.post("/:id", isLogin, createCommentCtrl);

//GET      //:id
commentsRouter.get("/:id", singleCommentCtrl);

//DELETE      //:id
commentsRouter.delete("/:id", isLogin, deleteCommentCtrl);

//PUT      //:id
commentsRouter.put("/:id", isLogin, updateCommentCtrl);

module.exports = commentsRouter;
