const path = require('path');

const express = require('express');

const shopControllerV2 = require('../controllers/shop-v2');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/', shopControllerV2.getIndexV2);

router.get('/products', shopControllerV2.getProductsV2);

router.get('/products/:productId', shopControllerV2.getProductV2);

router.get('/cart/:userId', shopControllerV2.getCartV2);

// router.post('/cart', isAuth, shopController.postCartV2);

// router.post('/cart-delete-item', isAuth, shopController.postCartDeleteProductV2);

// router.get('/checkout', isAuth, shopController.getCheckoutV2);

// router.post('/create-order', isAuth, shopController.postOrderV2);

// router.get('/orders', isAuth, shopController.getOrdersV2);

// router.get('/orders/:orderId', isAuth, shopController.getInvoicesV2);

module.exports = router;
