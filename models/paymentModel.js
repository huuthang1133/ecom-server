const { mongoose, Schema } = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Users",
    },
    status: {
      type: Boolean,
      default: false,
    },
    cart: {
      type: Array,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Payments", paymentSchema);
