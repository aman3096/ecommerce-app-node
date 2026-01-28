const { ObjectId } = require('mongodb');
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

exports.getAddProductV2 = (req, res, next) => {
  res.render
  ('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false
  });
};

exports.postAddProductV2 = (req, res, next) => {
  const title = req.body.title;
  const image = req.file;
  const price = req.body.price;
  const description = req.body.description;

  console.log('req.body:', req.body);
  console.log('req.file:', req.file);

  if(!image) {
    console.log('No image file received!');
    const data = {
        hasError: true,
        product: { 
            title: title,
            price: price,
            description: description
        },
        errorMessage: 'Attached file is not an image',
        validationErrors: []
    }
    return res.status(422).send(data);
  }
  const imageUrl = image.path;
  const product = new Product({
        title: title,
        price: price,
        description: description,
        imageUrl: imageUrl,
        userId: req.user ? req.user: ObjectId("694d560972869327cc373bbe")
  });
  product
    .save()
    .then(result => {
      console.log('Created Product');
      //res.redirect('/admin/products');
      const data = {
        status: 202,
        message: "Added Product Successfully"
      }
      res.status(202).send(data);
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500
      next(error);
    })
};