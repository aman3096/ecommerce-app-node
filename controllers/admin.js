const Product = require('../models/product');
const fileHelper = require('../util/file');
const constants = require('../util/constants');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const image = req.file;
  const price = req.body.price;
  const description = req.body.description;

  if(!image) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false,
      hasError: true,
      product: { 
        title: title,
        price: price,
        description: description
      },
      errorMessage: 'Attached file is not an image',
      validationErrors: []
    })
  }

  const imageUrl = image.path;
  const product = new Product({
    title: title,
    price: price,
    description: description,
    imageUrl: imageUrl,
    userId: req.user
  });
  product
    .save()
    .then(result => {
      console.log('Created Product');
      res.redirect('/admin/products');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500
      next(error);
    });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      if (!product) {
        return res.redirect('/');
      }
      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: editMode,
        product: product,
        currentPage: 1,
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500
      next(error);
    });
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const image = req.file
  const updatedDesc = req.body.description;

  Product.findById(prodId)
    .then(product => {
      if(req.user._id.toString() !== product.userId.toString()) {
        return res.redirect('/');
      }

      product.title = updatedTitle;
      product.price = updatedPrice;
      product.description = updatedDesc;
      if(image) {
        fileHelper.deleteFile(product.imageUrl);
        product.imageUrl = image.path;
      }
      
      return product.save();
    })
    .then(result => {
      console.log('UPDATED PRODUCT!');
      res.redirect('/admin/products');
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500
        next(error);
    });
};

exports.getProducts = (req, res, next) => {
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
      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products',
        currentPage: page,
        nextPage: page + 1,
        previousPage: page - 1,
        hasNextPage: (constants.ITEMS_PER_PAGE * page) < totalItems,
        hasPreviousPage: page > 1,
        lastPage: Math.ceil(totalItems / constants.ITEMS_PER_PAGE)
      });
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500
        next(error);
    });
};



exports.deleteProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId).then( product => {
    if(!product) {
      return next(new Error("Product Not found"));
    }
    //  fileHelper.deleteFile(product.imageUrl);
    Product.deleteOne({_id: prodId, userId: req.user._id}).then(data=>{
        console.log("DESTROYED PRODUCT")
     })
     .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
     })

  }).then(() => {
      console.log('DESTROYED PRODUCT');
      res.status(200).json({ message: 'Success' });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

