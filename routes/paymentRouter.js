const router = require("express").Router();
const paymentCtrl = require("../controllers/paymentCtrl");
const auth = require("../middleware/auth");
const authAdmin = require("../middleware/authAdmin");

router
  .route("/payment")
  .get(auth, paymentCtrl.getPayment)
  .post(auth, paymentCtrl.createPayment);
router.route("/payments").get(auth, authAdmin, paymentCtrl.getPayments);

module.exports = router;
