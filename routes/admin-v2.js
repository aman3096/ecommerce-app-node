const express = require('express');
const adminControllerV2 = require('../controllers/admin-v2');

const router = express.Router();

// /admin/products => GET
router.get('/products', adminControllerV2.getProductsV2);

// router.get('/v2/add-product', adminControllerV2.getAddProductV2);

// /admin/add-product => POST
router.post('/add-product', adminControllerV2.postAddProductV2);

router.get('/edit-product/:productId', adminControllerV2.getEditProductV2);

router.post('/edit-product', adminControllerV2.postEditProductV2);

router.delete('/product/:productId', adminControllerV2.deleteProductV2);

module.exports = router;
