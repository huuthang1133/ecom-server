const Category = require("../models/categoryModel");
const Products = require("../models/productModel");

// Filter, sorting and paginating

class APIfeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }
  filtering() {
    const queryObj = { ...this.queryString }; //queryString = req.query
    const excludedFields = ["page", "sort", "limit"];

    if (!queryObj.category) {
      excludedFields.push("category");
    }

    excludedFields.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(
      /\b(gte|gt|lt|lte|regex)\b/g,
      (match) => "$" + match
    );

    //    gte = greater than or equal
    //    lte = lesser than or equal
    //    lt = lesser than
    //    gt = greater than
    this.query.find(JSON.parse(queryStr));

    return this;
  }

  sorting() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }

    return this;
  }

  paginating() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 9;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

const productCtrl = {
  getProducts: async (req, res) => {
    try {
      const features = new APIfeatures(
        Products.find().populate({
          path: "category",
          populate: { path: "products" },
        }),
        req.query
      )
        .filtering()
        .sorting()
        .paginating();

      const products = await features.query;

      res.json({
        status: "success",
        result: products.length,
        products: products,
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  createProduct: async (req, res) => {
    try {
      const {
        product_id,
        title,
        price,
        description,
        quantity,
        images,
        category,
      } = req.body;
      if (!images) return res.status(400).json({ msg: "No image upload" });

      const product = await Products.findOne({ product_id });
      if (product)
        return res.status(400).json({ msg: "This product already exists." });

      const newProduct = new Products({
        product_id,
        title: title.toLowerCase(),
        price,
        description,
        quantity,
        images,
        category,
      });

      newProduct
        .save()
        .then(async (product) => {
          await Category.findOneAndUpdate(
            { _id: category },
            {
              $addToSet: { products: product._id },
            }
          );
          res.json({ msg: "Created a product successfully !!!" });
        })
        .catch((err) => {
          if (err.name === "ValidationError") {
            let errors = {};

            Object.keys(err.errors).forEach((key) => {
              errors[key] = err.errors[key].message;
            });
            return res.status(400).json({ msg: errors });
          }
        });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  deleteProduct: async (req, res) => {
    try {
      const { category } = await Products.findById(req.params.id);

      await Products.findByIdAndDelete(req.params.id).then(async () => {
        await Category.findOneAndUpdate(
          { _id: category },
          {
            $pull: { products: req.params.id },
          }
        );
      });
      res.json({ msg: "Deleted a Product" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  updateProduct: async (req, res) => {
    try {
      const { title, price, description, images, category } = req.body;
      if (!images) return res.status(400).json({ msg: "No image upload" });

      const { category: oldCategoryId } = await Products.findById(
        req.params.id
      );

      await Products.findOneAndUpdate(
        { _id: req.params.id },
        {
          title: title.toLowerCase(),
          price,
          description,
          images,
          category,
        }
      )
        .then(async () => {
          await Category.findOneAndUpdate(
            { _id: oldCategoryId },
            {
              $pull: { products: req.params.id },
            }
          );
        })
        .then(async () => {
          await Category.findOneAndUpdate(
            { _id: category },
            {
              $addToSet: { products: req.params.id },
            }
          );
        })
        .catch((err) => {
          if (err.name === "ValidationError") {
            let errors = {};

            Object.keys(err.errors).forEach((key) => {
              errors[key] = err.errors[key].message;
            });
            return res.status(400).json({ msg: errors });
          }
        });

      res.json({ msg: "Updated a Product" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
};

module.exports = productCtrl;
