const express = require("express");
const categoriesRouter = require("./routes/categories/categoriesRoutes");
const commentsRouter = require("./routes/comments/commentsRoutes");
const postsRouter = require("./routes/posts/postsRoutes");
const userRouter = require("./routes/users/userRoutes");
const globalErrorHandler = require("./middlewares/globalErrorHandler");
require("dotenv").config();
require("./config/dbConnect");

const app = express();

//Middlewares
app.use(express.json()); // Parse Incoming Payload

//-----------
//Routes
//-----------

//User ruote
app.use("/api/v1/users/", userRouter);

//-------------
//Post ruote
//-------------
app.use("/api/v1/posts/", postsRouter);

//=============
//Comment ruote
//=============

app.use("/api/v1/comments/", commentsRouter);

//==============
//Category ruote
//==============

app.use("/api/v1/categories/", categoriesRouter);

//Error Handlers Middleware
app.use(globalErrorHandler);

//404 Error Handler
app.use("*", (req, res) => {
  res.status(404).json({
    message: `${req.originalUrl} - Route Not Found`,
  });
});

//Listen to server

const PORT = process.env.PORT || 9000;

app.listen(PORT, console.log("Server is up and running on " + PORT));
