const express = require('express');
const router = express.Router();
const {addToCart,myCart,removeFromCart} = require("../controllers/Cart");
const checkLogin = require("../middlewares/checkLogin");
const isStudent = require("../middlewares/isStudent");
 
router.post('/add-to-cart',checkLogin,isStudent,addToCart);
router.get('/my-cart',checkLogin,isStudent,myCart);
router.delete("/remove-from-cart",checkLogin,isStudent,removeFromCart);

module.exports = router;