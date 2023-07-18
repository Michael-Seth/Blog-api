const User = require("../../model/User/User");
const bcrypt = require("bcryptjs");
const generateToken = require("../../utils/generateToken");
const getTokenFromHeader = require("../../utils/getTokenFromHeader");
const { errFunc, ErrFunc } = require("../../utils/errFunc");
const Post = require("../../model/Post/Post");
const Comment = require("../../model/Comment/Comment");
const Category = require("../../model/Category/Category");

//Register
const userRegisterCtrl = async (req, res, next) => {
  const { firstname, lastname, email, password } = req.body;

  try {
    //Check if email exist
    const userFound = await User.findOne({ email });

    if (userFound) {
      return next(new ErrFunc("User already exist", 500));
    }

    //hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hashSync(password, salt);

    //Create a user
    const user = await User.create({
      firstname,
      lastname,
      email,
      password: hashedPassword,
    });

    res.json({
      status: "success",
      data: user,
    });
  } catch (error) {
    next(new ErrFunc(error.message));
  }
};

//POST      /api/v1/posts/login
const userLoginCtrl = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    //Check if user exist by email
    const userFound = await User.findOne({ email });
    if (!userFound) {
      return res.json({
        msg: "Invalid login credentials",
      });
    }
    //Verify Password
    const isPasswordMatched = await bcrypt.compare(
      password,
      userFound.password
    );
    if (!isPasswordMatched) {
      return next(errFunc("Invalid login credentials", 402));
    }

    res.json({
      status: "success",
      data: {
        firstname: userFound.firstname,
        lastname: userFound.lastname,
        email: userFound.email,
        isAdmin: userFound.isAdmin,
        token: generateToken(userFound._id),
      },
    });
  } catch (error) {
    next(errFunc(error.message));
  }
};

//Who Viewed My Profile
const whoViewedMyProfile = async (req, res, next) => {
  try {
    //1. Find the original
    const user = await User.findById(req.params.id);
    //2. Find the user who viewed the original user
    const userWhoViewed = await User.findById(req.userAuth);

    //3.Check if original and who viewd are found
    if (user && userWhoViewed) {
      //4. check if userWhoViewed is already in the users viewers array
      const isUserAlreadyViewed = user.viewers.find(
        (viewer) => viewer.toString() === userWhoViewed._id.toJSON()
      );
      if (isUserAlreadyViewed) {
        return next(errFunc("You already viewed this profile"));
      } else {
        //5. Push the userWhoViewed to the user's viewers array
        user.viewers.push(userWhoViewed._id);
        //6. Save the user
        await user.save();
        res.json({
          status: "success",
          data: "You have successfully viewed this profile",
        });
      }
    }
  } catch (error) {
    next(errFunc(error.message));
  }
};

//Following Controller
const followingCtrl = async (req, res, next) => {
  try {
    // 1. Find the user to follow
    const userToFollow = await User.findById(req.params.id);
    // 2. Find the user who is following
    const userWhoFollowed = await User.findById(req.userAuth);

    // 3. Check if user and userWhoFollowed are found
    if (userToFollow && userWhoFollowed) {
      // 4. Check if userWhoFollowed is already in the user's followers array
      const isUserAlreadyFollowed = userToFollow.following.find(
        (follower) => follower.toString() === userWhoFollowed._id.toString()
      );

      // 5. Check if userWhoFollowed is the same as userToFollow
      const isUserSelfFollow =
        userWhoFollowed._id.toString() === userToFollow._id.toString();

      if (isUserAlreadyFollowed || isUserSelfFollow) {
        return next(
          errFunc(
            "You cannot follow yourself or you already followed this user"
          )
        );
      } else {
        // 6. Push userWhoFollowed into the user's followers array
        userToFollow.followers.push(userWhoFollowed._id);
        // 7. Push userToFollow into the userWhoFollowed's following array
        userWhoFollowed.following.push(userToFollow._id);
        // 8. Save changes
        await userWhoFollowed.save();
        await userToFollow.save();
        res.json({
          status: "success",
          data: "You have successfully followed this user",
        });
      }
    }
  } catch (error) {
    next(errFunc(error.message));
  }
};

//unFollowing Controller
const unFollowerCtrl = async (req, res, next) => {
  try {
    //1. Find the user to unfolloW
    const userToBeUnfollowed = await User.findById(req.params.id);
    //2. Find the user who is unfollowing
    const userWhoUnFollowed = await User.findById(req.userAuth);
    //3. Check if user and userWhoUnFollowed are found
    if (userToBeUnfollowed && userWhoUnFollowed) {
      //4. Check if userWhoUnfollowed is already in the user's followers array
      const isUserAlreadyFollowed = userToBeUnfollowed.followers.find(
        (follower) => follower.toString() === userWhoUnFollowed._id.toString()
      );
      if (!isUserAlreadyFollowed) {
        return next(errFunc("You have not followed this user"));
      } else {
        //5. Remove userWhoUnFollowed from the user's followers array
        userToBeUnfollowed.followers = userToBeUnfollowed.followers.filter(
          (follower) => follower.toString() !== userWhoUnFollowed._id.toString()
        );
        //save the user
        await userToBeUnfollowed.save();
        //7. Remove userToBeInfollowed from the userWhoUnfollowed's following array
        userWhoUnFollowed.following = userWhoUnFollowed.following.filter(
          (following) =>
            following.toString() !== userToBeUnfollowed._id.toString()
        );

        //8. save the user
        await userWhoUnFollowed.save();
        res.json({
          status: "success",
          data: "You have successfully unfollowed this user",
        });
      }
    }
  } catch (error) {
    next(errFunc(error.message));
  }
};

//GET ALL /api/v1/users
const userCtrl = async (req, res, next) => {
  try {
    const users = await User.find();

    res.json({
      status: "success",
      data: users,
    });
  } catch (error) {
    next(errFunc(error.message));
  }
};

//GEt BLOCK USER /api/v1/users/block
const blockUserCtrl = async (req, res, next) => {
  try {
    //1. Find the user to be blocked
    const userToBeBlocked = await User.findById(req.params.id);
    //2. Find the user who is blocking
    const userWhoBlocked = await User.findById(req.userAuth);
    //3. Check if userToBeBlocked and userWhoBlocked are found
    if (userWhoBlocked && userToBeBlocked) {
      //4. Check if userWhoUnfollowed is already in the user's blocked array
      const isUserAlreadyBlocked = userWhoBlocked.blocked.find(
        (blocked) => blocked.toString() === userToBeBlocked._id.toString()
      );
      const isUserSelfBlock =
        userToBeBlocked._id.toString() === userWhoBlocked._id.toString();
      if (isUserAlreadyBlocked) {
        return next(errFunc("You already blocked this user"));
      }

      if (isUserSelfBlock) {
        return next(errFunc("You cannot block yourself"));
      }

      //7.Push userToBleBlocked to the userWhoBlocked's blocked arr
      userWhoBlocked.blocked.push(userToBeBlocked._id);
      //8. save
      await userWhoBlocked.save();
      res.json({
        status: "success",
        data: "You have successfully blocked this user",
      });
    }
  } catch (error) {
    next(errFunc(error.message));
  }
};

//GEt UNBLOCK USER /api/v1/users/unblock
const unblockUserCtrl = async (req, res, next) => {
  try {
    //1. find the user to be unblocked
    const userToBeUnBlocked = await User.findById(req.params.id);
    //2. find the user who is unblocking
    const userWhoUnBlocked = await User.findById(req.userAuth);
    //3. check if userToBeUnBlocked and userWhoUnblocked are found
    if (userToBeUnBlocked && userWhoUnBlocked) {
      //4. Check if userToBeUnBlocked is already in the arrays's of userWhoUnBlocked
      const isUserAlreadyBlocked = userWhoUnBlocked.blocked.find(
        (blocked) => blocked.toString() === userToBeUnBlocked._id.toString()
      );
      if (!isUserAlreadyBlocked) {
        return next(appErr("You have not blocked this user"));
      }
      //Remove the userToBeUnblocked from the main user
      userWhoUnBlocked.blocked = userWhoUnBlocked.blocked.filter(
        (blocked) => blocked.toString() !== userToBeUnBlocked._id.toString()
      );
      //Save
      await userWhoUnBlocked.save();
      res.json({
        status: "success",
        data: "You have successfully unblocked this user",
      });
    }
  } catch (error) {
    next(appErr(error.message));
  }
};

//GET ADMIN BLOCK /api/v1/users
const adminBlockUserCtrl = async (req, res, next) => {
  try {
    //Find User to be blocked
    const userToBeBlocked = await User.findById(req.params.id);

    //Check if user is found
    if (!userToBeBlocked) {
      return next(errFunc("User not found"));
    }
    //Change the isBlocked to true
    userToBeBlocked.isBlocked = true;
    //Save
    await userToBeBlocked.save();
    res.json({
      status: "success",
      data: "You have successfully blocked this user",
    });
  } catch (error) {
    next(errFunc(error.message));
  }
};

//GET ADMIN UNBLOCK /api/v1/users
const adminUnBlockUserCtrl = async (req, res, next) => {
  try {
    //Find User to be blocked
    const userToBeUnBlocked = await User.findById(req.params.id);

    //Check if user is found
    if (!userToBeUnBlocked) {
      return next(errFunc("User not found"));
    }
    //Change the isBlocked to true
    userToBeUnBlocked.isBlocked = false;
    //Save
    await userToBeUnBlocked.save();
    res.json({
      status: "success",
      data: "You have successfully unblocked this user",
    });
  } catch (error) {
    next(errFunc(error.message));
  }
};

//GET      /api/v1/users/profile/:id
const userProfileCtrl = async (req, res, next) => {
  //const { id } = req.params;
  try {
    //    const token = getTokenFromHeader(req);
    //    console.log(token);

    const user = await User.findById(req.userAuth);
    res.json({
      status: "success",
      data: user,
    });
  } catch (error) {
    next(errFunc(error.message));
  }
};

//DELETE      /api/v1/users/:id
const deleteUserCtrl = async (req, res, next) => {
  try {
    const userToDelete = await User.findById(req.userAuth);

    //find all post to be deleted
    await Post.deleteMany({ user: req.userAuth });
    await Comment.deleteMany({ user: req.userAuth });
    await Category.deleteMany({ user: req.userAuth });
    await userToDelete.delete();

    res.json({
      status: "success",
      data: "Your account has been deleted successfully!",
    });
  } catch (error) {
    next(errFunc(error.message));
  }
};

//PUT      /api/v1/users/:id
const updateUserCtrl = async (req, res, next) => {
  const { email, firstname, lastname } = req.body;
  try {
    if (email) {
      const emailTaken = await User.findOne({ email });
      if (emailTaken) {
        return next(
          errFunc("This Email is registered with another account", 401)
        );
      }
    }

    const user = await User.findByIdAndUpdate(
      req.userAuth,
      {
        email,
        firstname,
        lastname,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    //Send response

    res.json({
      status: "success",
      data: user,
    });
  } catch (error) {
    next(errFunc(error.message));
  }
};

//PUT      /api/v1/users/:id
const updatePasswordCtrl = async (req, res, next) => {
  const { password } = req.body;
  try {
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      await User.findByIdAndUpdate(
        req.userAuth,
        { hashedPassword },
        { new: true, runValidators: true }
      );
      res.json({
        status: "success",
        data: "Password has been changed",
      });
    } else {
      return next(errFunc("Please provide a password", 401));
    }
  } catch (error) {
    next(errFunc(error.message));
  }
};

//Profile Photo Upload
const profilePhotoUplaodCtrl = async (req, res, next) => {
  console.log(req.file);
  try {
    //1. Find the user to be updated
    const userToUpdate = await User.findById(req.userAuth);
    //2. Check if user is found
    if (!userToUpdate) {
      return next(errFunc("User not found", 403));
    }
    //3. Check if user is blocked
    if (userToUpdate.isBlocked) {
      return next(errFunc("Action not allowed, your account is blocked", 403));
    }
    //4. Check if user is updating their photo

    if (req.file) {
      //5.  Update profile photo
      await User.findByIdAndUpdate(
        req.userAuth,
        {
          $set: {
            profilePhoto: req.file.path,
          },
        },
        {
          new: true,
        }
      );
      res.json({
        status: "success",
        data: "You have successfully updated your profile photo",
      });
    }
  } catch (error) {
    next(errFunc(error.message, 500));
  }
};

module.exports = {
  userRegisterCtrl,
  userCtrl,
  userLoginCtrl,
  userProfileCtrl,
  deleteUserCtrl,
  updateUserCtrl,
  updatePasswordCtrl,
  profilePhotoUplaodCtrl,
  whoViewedMyProfile,
  followingCtrl,
  unFollowerCtrl,
  blockUserCtrl,
  unblockUserCtrl,
  adminBlockUserCtrl,
  adminUnBlockUserCtrl,
};
