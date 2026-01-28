const Product = require('../models/product');
const constants = require('../util/constants');

exports.getProductsV2 = (req, res, next) => {
        const page = +req.query.page || 1;
        let totalItems; 
    
        Product.find()
        .countDocuments()
        .then(numProducts => {
          totalItems = numProducts
          return Product.find({})
            .skip(page-1)
            .limit(constants.ITEMS_PER_PAGE)
        })
        .then(products => {
          const data = {
            prods: products,
            pageTitle: 'Admin Products',
            path: '/admin/products',
            currentPage: page,
            nextPage: page + 1,
            previousPage: page - 1,
            hasNextPage: (constants.ITEMS_PER_PAGE * page) < totalItems,
            hasPreviousPage: page > 1,
            lastPage: Math.ceil(totalItems / constants.ITEMS_PER_PAGE)
          }
          res.send(data);
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500
            next(error);
        });
}