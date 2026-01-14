const fs = require('fs');
const path = require('path');

const Product = require('../models/product');
const Order = require('../models/order');

const PDFDocument = require("pdfkit");
const constants = require("../util/constants");

exports.getProducts = (req, res, next) => {
  const page = +req.query.page || 1
  let totalItems;

  Product.find()
  .countDocuments()
  .then((numProducts) => {
    totalItems = numProducts
    return Product.find({})
    .skip(page-1)
    .limit(constants.ITEMS_PER_PAGE)
  })
    .then(products => {
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'All Shop Products',
        path: '/products',
        currentPage: page,
        nextPage: page + 1,
        previousPage: page -1,
        hasNextPage: page* constants.ITEMS_PER_PAGE < totalItems,
        hasPreviousPage: page > 1,
        lastPage: Math.ceil( totalItems / constants.ITEMS_PER_PAGE)
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error)
    });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  const page = +req.query.page || 1;
  let totalItems; 
  Product.findById(prodId)
    .then( numProducts => {
      totalItems = numProducts
      return Product.find({_id: prodId})
    })
    .then(product => {
      res.render('shop/product-detail', {
        product: product,
        pageTitle: product.title,
        path: '/products',
        currentPage: page,
        nextPage: page + 1,
        previousPage: page -1,
        hasNextPage: page* constants.ITEMS_PER_PAGE < totalItems,
        hasPreviousPage: page > 1,
        lastPage: Math.ceil( totalItems / constants.ITEMS_PER_PAGE)
        
      });
    })
    .catch(err => console.log(err));
};

exports.getIndex = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;

  Product.find()
    .countDocuments()
    .then(numProducts => {
      totalItems = numProducts;
      return Product.find()
        .skip((page - 1) * constants.ITEMS_PER_PAGE)
        .limit(constants.ITEMS_PER_PAGE);
    })
    .then(products => {
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/',
        currentPage: page,
        hasNextPage: constants.ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / constants.ITEMS_PER_PAGE)
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getCart = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .then(user => {
      const products = user.cart.items;
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: products
      });
    })
    .catch(err => console.log(err));
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then(product => {
      return req.user.addToCart(product);
    })
    .then(result => {
      console.log(result);
      res.redirect('/cart');
    });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .removeFromCart(prodId)
    .then(result => {
      res.redirect('/cart');
    })
    .catch(err => console.log(err));
};

exports.getCheckout = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .then(user => {
      const products = user.cart.items;
      let total = 0;
      products.forEach(product=>{
        total+= product.quantity * product.productId.price
      })
      res.render('shop/checkout', {
        path: '/checkout',
        pageTitle: 'Checkout',
        products: products,
        totalSum: total 
      });
    })
    .catch(err => console.log(err));
}

exports.postOrder = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .then(user => {
      const products = user.cart.items.map(i => {
        return { quantity: i.quantity, product: { ...i.productId._doc } };
      });
      const order = new Order({
        user: {
          email: req.user.email,
          userId: req.user
        },
        products: products
      });
      return order.save();
    })
    .then(result => {
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect('/orders');
    })
    .catch(err => console.log(err));
};

exports.getOrders = (req, res, next) => {
  Order.find({ 'user.userId': req.user._id })
    .then(orders => {
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: orders
      });
    })
    .catch(err => console.log(err));
};

exports.getInvoices = (req, res, next) => {
  const orderId = req.params.orderId;
  const invoiceName = "invoice-" + orderId + ".pdf";
  const invoicePath = path.join('data', 'invoices', invoiceName);
  Order.findById(orderId).then( order => {
    if(!order) {
      return next(new Error('No order found.'))
    }
    if(order.user.userId.toString() !== req.user._id.toString()) {
      return new Error('Unauthorized');
    }
    // fs.readFile(invoicePath, (err, data)=>{
    //     if(err){
    //       return next(err);
    //     }
    //     res.setHeader("Content-Type", "application/pdf")
    //     res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"');
    //     res.send(data);
    // });
    //recommende way for bigger files - streaming 
    // const file = fs.createReadStream(invoicePath);
    // res.setHeader("Content-Type", "application/pdf")
    // res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"');
    // file.pipe(res);

    const pdfDocument = new PDFDocument();
    pdfDocument.pipe(fs.createWriteStream(invoicePath));
    pdfDocument.pipe(res);
    pdfDocument.text("Hello files");

    pdfDocument.fontSize(26).text('Invoice', {
      underline: true
    })

    pdfDocument.text("---------------------")
    let totalPrice = 0;
    order.products.forEach(product => {
      totalPrice += (product.quantity * product.product.price)
      pdfDocument.text(product.product.title + ' - ' + product.quantity + ' x' + '$' + product.product.price)
    })
    pdfDocument.text(`Total Price: ${totalPrice}`)
    pdfDocument.end();

  }).catch(err=>next(err));

}