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
          res.json(data);
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

exports.postAddProductV2 =async (req, res, next) => {
    try {
        const title = req.body.title;
        // const image = req.file;
        const image = req.body.image;
        const price = req.body.price;
        const description = req.body.description;

        // if(!image) {
        //     console.log('No image file received!');
        //     const data = {
        //         hasError: true,
        //         product: { 
        //             title: title,
        //             price: price,
        //             description: description
        //         },
        //         errorMessage: 'Attached file is not an image',
        //         validationErrors: []
        //     }
        //     return res.status(422).send(data);
        // }
        const imageUrl = image;
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
    } catch(err) {
        const error = new Error(err);
        error.httpStatusCode = 500
        next(error);
    }
};

exports.getEditProductV2 = (req, res, next) => {
    try {
        const editMode = req.query.edit;
        if (!editMode) {
            res.data("Not editable");
        }
        const prodId = req.params.productId;
        Product.findById(prodId)
            .then(product => {
            if (!product) {
                // return res.redirect('/');
                res.data("No Product found");

            }
            const data = {
                pageTitle: 'Edit Product',
                path: '/admin/edit-product',
                editing: editMode,
                product: product,
                currentPage: 1,
            }
            res.json(data);
            })
            .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500
            next(error);
            });
    } catch(err) {
      const error = new Error(err);
      error.httpStatusCode = 500
      next(error);
    }
};


exports.postEditProductV2 = (req, res, next) => {
    try {
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
            // res.redirect('/admin/products');
            res.status(200).send("Product is updated");
            })
            .catch(err => {
                const error = new Error(err);
                error.httpStatusCode = 500
                next(error);
            });
    } catch(err) {
        const error = new Error(err);
        error.httpStatusCode = 500
        next(error);
    }
};

exports.deleteProductV2 = async (req, res, next) => {
    try {
        const prodId = req.params.productId;
        const product = await Product.findById(prodId);
        if(!product) {
            const notFound = { message: "Unable to delete: Product not found"}
            return res.status(410).json(notFound);
        }

        await Product.deleteOne({_id: prodId})
        console.log('DESTROYED PRODUCT');
        res.status(200).json({ message: `Successfully removed product with productId: ${prodId}`});
    } catch(err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return res.send("Unable to delete: Product Id not found");
    } 
};