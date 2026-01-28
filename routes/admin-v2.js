const express = require('express');
const adminControllerV2 = require('../controllers/admin-v2');

const router = express.Router();

router.get('/v2/products', adminControllerV2.getProductsV2);

module.exports = router;
