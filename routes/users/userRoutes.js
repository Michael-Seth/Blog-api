const express = require("express");
const {
  userRegisterCtrl,
  userLoginCtrl,
  userCtrl,
  userProfileCtrl,
  deleteUserCtrl,
  updateUserCtrl,
  profilePhotoUplaodCtrl,
  whoViewedMyProfile,
  followingCtrl,
  unFollowerCtrl,
  blockUserCtrl,
  unblockUserCtrl,
  adminBlockUserCtrl,
  adminUnBlockUserCtrl,
  updatePasswordCtrl,
} = require("../../controllers/users/userCtrl");
const isLogin = require("../../middlewares/isLogin");
const storage = require("../../config/cloudinary");
const multer = require("multer");
const isAdmin = require("../../middlewares/isAdmin");
const userRouter = express.Router();

//Instance of multer
const upload = multer({ storage });

//POST      /api/v1/posts/register
userRouter.post("/register", userRegisterCtrl);

//POST      /api/v1/posts/login
userRouter.post("/login", userLoginCtrl);

//GET ALL USERS  /api/v1/users
userRouter.get("/", userCtrl);

userRouter.get("/profile-viewers/:id", isLogin, whoViewedMyProfile);

//GET      /api/v1/users/following/:id
userRouter.get("/following/:id", isLogin, followingCtrl);

//GET      /api/v1/users/unFollow/:id
userRouter.get("/unfollow/:id", isLogin, unFollowerCtrl);

//GET      /api/v1/users/block/:id
userRouter.get("/block/:id", isLogin, blockUserCtrl);

//GET      /api/v1/users/unblock/:id
userRouter.get("/unblock/:id", isLogin, unblockUserCtrl);

//GET      /api/v1/users/block/:id
userRouter.put("/admin-block/:id", isLogin, isAdmin, adminBlockUserCtrl);

//GET      /api/v1/users/block/:id
userRouter.put("/admin-unblock/:id", isLogin, isAdmin, adminUnBlockUserCtrl);

//GET      /api/v1/users/profile/:id
userRouter.get("/profile/", isLogin, userProfileCtrl);

//DELETE      /api/v1/users/:id
userRouter.delete("/delete-account", isLogin, deleteUserCtrl);

//PUT      /api/v1/users/:id
userRouter.put("/", isLogin, updateUserCtrl);

//PUT   (For Password)   /api/v1/users/:id
userRouter.put("/update-password", isLogin, updatePasswordCtrl);

//POST
userRouter.post(
  "/profile-photo-upload",
  isLogin,
  upload.single("profile"),
  profilePhotoUplaodCtrl
);

module.exports = userRouter;
