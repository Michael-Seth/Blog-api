const User = require("../model/User/User");
const { errFunc } = require("../utils/errFunc");
const getTokenFromHeader = require("../utils/getTokenFromHeader");
const verifyToken = require("../utils/verifyToken");

const isAdmin = async (req, res, next) => {
  const token = getTokenFromHeader(req);
  // verfy token
  const decodedUser = verifyToken(token);
  //Save the user in request object
  req.userAuth = decodedUser.id;
  //Find the User in the DB
  const user = await User.findById(decodedUser.id);
  if (user.isAdmin) {
    return next();
  } else {
    return next(errFunc("Access denied, Admin only", 403));
  }
};

module.exports = isAdmin;
