const { mongoose, Schema } = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    product_id: {
      type: String,
      unique: true,
      trim: true,
      required: true,
    },
    title: {
      type: String,
      trim: true,
      required: true,
    },
    price: {
      type: Number,
      min: 0,
      trim: true,
      required: true,
    },
    quantity: {
      type: Number,
      min: 0,
      trim: true,
      required: true,
      validate: {
        validator: Number.isInteger,
        message: `Quantity must be positive integer number`,
      },
    },
    description: {
      type: String,
      required: true,
    },
    images: {
      type: Object,
      required: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    checked: {
      type: Boolean,
      default: false,
    },
    sold: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true, //important
  }
);

module.exports = mongoose.model("Products", productSchema);
