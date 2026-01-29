const express = require('express');
const adminControllerV2 = require('../controllers/admin-v2');

const router = express.Router();

// /admin/products => GET
router.get('/v2/products', adminControllerV2.getProductsV2);

// router.get('/v2/add-product', adminControllerV2.getAddProductV2);

// /admin/add-product => POST
router.post('/v2/add-product', adminControllerV2.postAddProductV2);

router.get('/v2/edit-product/:productId', adminControllerV2.getEditProductV2);

// router.post('/v2/edit-product', adminControllerV2.postEditProduct);

// router.delete('/v2/product/:productId', adminControllerV2.deleteProduct);

module.exports = router;
