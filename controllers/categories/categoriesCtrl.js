const Category = require("../../model/Category/Category");
const { errFunc } = require("../../utils/errFunc");

//POST      /
const createCategoryCtrl = async (req, res, next) => {
  const { title } = req.body;
  try {
    const category = await Category.create({ title, user: req.userAuth });
    res.json({
      status: "success",
      data: category,
    });
  } catch (error) {
    next(errFunc(error.message));
  }
};

//GET      /:id
const singleCategoryCtrl = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    res.json({
      status: "success",
      data: category,
    });
  } catch (error) {
    next(errFunc(error.message));
  }
};

//GET    All  /:id
const allCategoryCtrl = async (req, res, next) => {
  try {
    const categories = await Category.find();
    res.json({
      status: "success",
      data: categories,
    });
  } catch (error) {
    next(errFunc(error.message));
  }
};

//DELETE      /:id
const deleteCategoryCtrl = async (req, res, next) => {
  try {
    await Category.findByIdAndDelete(req.params.id);

    res.json({
      status: "success",
      data: "You have successfully deleted this category",
    });
  } catch (error) {
    next(errFunc(error.message));
  }
};

//PUT      /:id
const updateCategoryCtrl = async (req, res, next) => {
  const { title } = req.body;
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { title },
      { new: true, runValidators: true }
    );

    res.json({
      status: "success",
      data: category,
    });
  } catch (error) {
    next(errFunc(error.message));
  }
};

module.exports = {
  createCategoryCtrl,
  singleCategoryCtrl,
  deleteCategoryCtrl,
  updateCategoryCtrl,
  allCategoryCtrl,
};
