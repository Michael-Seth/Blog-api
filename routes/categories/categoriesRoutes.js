const express = require("express");
const {
  createCategoryCtrl,
  singleCategoryCtrl,
  deleteCategoryCtrl,
  updateCategoryCtrl,
  allCategoryCtrl,
} = require("../../controllers/categories/categoriesCtrl");
const isLogin = require("../../middlewares/isLogin");
const categoriesRouter = express.Router();

//POST      /
categoriesRouter.post("/", isLogin, createCategoryCtrl);

//GET      /:id
categoriesRouter.get("/:id", singleCategoryCtrl);

//GET   All   /:id
categoriesRouter.get("/", allCategoryCtrl);

//DELETE      /:id
categoriesRouter.delete("/:id", isLogin, deleteCategoryCtrl);

//PUT      /:id
categoriesRouter.put("/:id", isLogin, updateCategoryCtrl);

module.exports = categoriesRouter;
