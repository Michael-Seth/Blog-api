const { errFunc } = require("../utils/errFunc");
const getTokenFromHeader = require("../utils/getTokenFromHeader");
const verifyToken = require("../utils/verifyToken");

const isLogin = (req, res, next) => {
  const token = getTokenFromHeader(req);

  // verfy token
  const decodedUser = verifyToken(token);

  //console.log(decodedUser);
  //Save the user in request object
  req.userAuth = decodedUser.id;

  if (!decodedUser) {
    return next(
      errFunc("Invalid/Expired Token, Please Go Back And Login", 500)
    );
  } else {
    next();
  }
};

module.exports = isLogin;
