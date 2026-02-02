const fs = require('fs');
const path = require('path');

const Product = require('../models/product');
const Order = require('../models/order');
const User = require('../models/user');

const PDFDocument = require("pdfkit");
const constants = require("../util/constants");

exports.getProductsV2 = async (req, res, next) => {
    try {
    const page = +req.query.page || 1
    let totalItems;
    const numProducts = await Product.find()
    .countDocuments()
   
    totalItems = numProducts
    const products = await Product.
        find({})
        .skip(page-1)
        .limit(constants.ITEMS_PER_PAGE)

        const responseData = {
            prods: products,
            pageTitle: 'All Shop Products',
            path: '/products',
            currentPage: page,
            nextPage: page + 1,
            previousPage: page - 1,
            hasNextPage: (constants.ITEMS_PER_PAGE * page) < totalItems,
            hasPreviousPage: page > 1,
            lastPage: Math.ceil( totalItems / constants.ITEMS_PER_PAGE)
        }
        res.json(responseData);
    } catch(err) {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error)
    }
};

exports.getProductV2 = async (req, res, next) => {
    try {
        const prodId = req.params.productId;
        const page = +req.query.page || 1;
        let totalItems; 
        const productWithId = await Product.findById(prodId)
        totalItems = productWithId;

        const data =  {      
            product: productWithId,
            pageTitle: productWithId.title,
            path: '/products',
            currentPage: page,
            nextPage: page + 1,
            previousPage: page -1,
            hasNextPage: page* constants.ITEMS_PER_PAGE < totalItems,
            hasPreviousPage: page > 1,
            lastPage: Math.ceil( totalItems / constants.ITEMS_PER_PAGE)
        }
        res.json(data);
    } catch(err) {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    }

};

exports.getIndexV2 = async (req, res, next) => {
    try {
        const numProducts = await Product.find().countDocuments()

        let totalItems = numProducts;
        const products = await Product.find()


        const data = {
            prods: products,
            pageTitle: 'Shop',
            path: '/'
        }
        res.json(data);
    } catch(err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
}

exports.getCartV2 = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.userId).populate('cart.items.productId', 'title price');
        const cartItems = user.cart.items.map(item => ({
            productId: item.productId._id,
            title: item.productId.title,
            price: item.productId.price,
            quantity: item.quantity
        }));
        const data = {          
            path: '/cart',
            pageTitle: 'Your Cart',
            products: cartItems
        }
        res.json(data);
    } catch(err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
};

exports.postCartV2 = async (req, res, next) => {
    try {
        const prodId = req.body.productId;
        const quantity = req.body.quantity;
        const email = req.body.email;
        const product = await Product.findById(prodId);
        if (!product) {
            const error = new Error('Product not found');
            error.httpStatusCode = 404;
            return next(error);
        }
        const user = await User.findOne({ email });
        if (!user) {
            const error = new Error('User not found');
            error.httpStatusCode = 404;
            return next(error);
        }
        const qty = parseInt(quantity, 10) || 1;
        const cartProductIndex = user.cart.items.findIndex(item => item.productId.toString() === prodId.toString());
        if (cartProductIndex >= 0) {
            user.cart.items[cartProductIndex].quantity = (user.cart.items[cartProductIndex].quantity || 0) + qty;
        } else {
            user.cart.items.push({ productId: prodId, quantity: qty });
        }
        await user.save();
        await user.populate('cart.items.productId', 'title price');
        const cartItems = user.cart.items.map(item => ({
            productId: item.productId._id,
            title: item.productId.title,
            price: item.productId.price,
            quantity: item.quantity
        }));
        const data = {
                path: '/cart',
                pageTitle: 'Your Cart',
                products: cartItems
        }
        res.json(data);
    } catch(err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
};

exports.emptyCartV2 = async (req, res, next) => {
    try {
        const prodId = req.body.productId;
        const email = req.body.email;
        const product = await Product.findById(prodId);
        if (!product) {
            const error = new Error('Product not found');
            error.httpStatusCode = 404;
            return next(error);
        }
        const user = await User.findOne({ email });
        if (!user) {
            const error = new Error('User not found');
            error.httpStatusCode = 404;
            return next(error);
        }
        user.cart.items = [];
        await user.save();
        const data = {
            status: 200,
            message: "Cart is Empty now"
        }
        res.json(data);
    } catch(err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
}

exports.postCartDeleteProductV2 = async (req, res, next) => {
    try {
        const prodId = req.body.productId;
        const email = req.body.email;
        const product = await Product.findById(prodId);
        if (!product) {
            const error = new Error('Product not found');
            error.httpStatusCode = 404;
            return next(error);
        }
        const user = await User.findOne({ email });
        if (!user) {
            const error = new Error('User not found');
            error.httpStatusCode = 404;
            return next(error);
        }
        user.cart.items = user.cart.items.filter(item =>
            item.productId.toString() !== prodId.toString()
        )
        await user.save();
        const data = {
            message:"Cart Item Removed Successfully"
        }
        res.json(data);
    } catch(err) {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    }
};