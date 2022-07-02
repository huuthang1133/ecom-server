const Payments = require("../models/paymentModel");
const Users = require("../models/userModel");
const Products = require("../models/productModel");
const productModel = require("../models/productModel");

const paymentCtrl = {
  getPayment: async (req, res) => {
    try {
      const payments = await Payments.find({
        user: req.user.id,
      })
        .sort("-createdAt")
        .populate("user");
      res.json(payments);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  getPayments: async (req, res) => {
    try {
      const payments = await Payments.find().sort("-createdAt");
      res.json(payments);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  createPayment: async (req, res) => {
    try {
      const user = await Users.findById(req.user.id).select("name email");
      if (!user) return res.status(400).json({ msg: "User does not exist." });

      const { cart } = req.body;

      const newPayment = new Payments({
        user: user._id,
        cart,
      });

      cart.forEach(async (item) => {
        const { quantity } = item;
        await Products.findOneAndUpdate(
          { _id: item._id },
          { $inc: { quantity: -item.quantity, sold: item.quantity } }
        );
      });

      await newPayment.save();
      res.json({ msg: "Payment Success!" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
};

const sold = async (id, quantity, oldSold) => {
  await Products.findOneAndUpdate(
    { _id: id },
    {
      sold: quantity + oldSold,
    }
  );
};

module.exports = paymentCtrl;
