const { mongoose, Schema } = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    products: [{ type: Schema.Types.ObjectId, ref: "Products" }],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Category", categorySchema);
