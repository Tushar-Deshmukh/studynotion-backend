const express = require('express');
const router = express.Router();
const checkLogin = require('../middlewares/checkLogin');
const { createCheckoutSession,enrollCourse } = require('../controllers/Stripe');


router.post("/create-checkout-session",checkLogin,createCheckoutSession)
router.post('/webhook', express.raw({type: 'application/json'}),enrollCourse)

module.exports = router;