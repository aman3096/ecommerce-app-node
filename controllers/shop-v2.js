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

// exports.postCartV2 = (req, res, next) => {
//   const prodId = ObjectID(req.body.productId);
//   Product.findById(prodId)
//     .then(product => {
//       return req.user.addToCart(product);
//     })
//     .then(result => {
//       console.log("created cart");
//       res.redirect('/cart');
//     }).catch(err=> {
//       const error = new Error(err);
//       error.httpStatusCode = 500;
//       return next(error);
//     });
// };

// exports.postCartDeleteProductV2 = (req, res, next) => {
//   const prodId = req.body.productId;
//   req.user
//     .removeFromCart(prodId)
//     .then(result => {
//       res.redirect('/cart');
//     })
//     .catch(err => {
//       const error = new Error(err);
//       error.httpStatusCode = 500;
//       return next(error);
//     });
// };

// exports.getCheckoutV2 = (req, res, next) => {
//   req.user
//     .populate('cart.items.productId')
//     .then(user => {
//       const products = user.cart.items;
//       let total = 0;
//       products.forEach(product=>{
//         total+= product.quantity * product.productId.price
//       })
//       res.render('shop/checkout', {
//         path: '/checkout',
//         pageTitle: 'Checkout',
//         products: products,
//         totalSum: total 
//       });
//     })
//     .catch(err => {
//       const error = new Error(err);
//       error.httpStatusCode = 500;
//       return next(error);
//     });
// }

// exports.postOrderV2 = (req, res, next) => {
//   req.user
//     .populate('cart.items.productId')
//     .then(user => {
//       const products = user.cart.items.map(i => {
//         return { quantity: i.quantity, product: { ...i.productId._doc } };
//       });
//       const order = new Order({
//         user: {
//           email: req.user.email,
//           userId: req.user
//         },
//         products: products
//       });
//       return order.save();
//     })
//     .then(result => {
//       return req.user.clearCart();
//     })
//     .then(() => {
//       res.redirect('/orders');
//     })
//     .catch(err => {
//         const error = new Error(err);
//         error.httpStatusCode = 500;
//         return next(error);
//     });
// };

// exports.getOrdersV2 = (req, res, next) => {
//   Order.find({ 'user.userId': req.user._id })
//     .then(orders => {
//       res.render('shop/orders', {
//         path: '/orders',
//         pageTitle: 'Your Orders',
//         orders: orders
//       });
//     })
//     .catch(err => {
//       const error = new Error(err);
//       error.httpStatusCode = 500;
//       return next(error);
//     });
// };

// exports.getInvoicesV2 = (req, res, next) => {
//     const orderId = req.params.orderId;
//   // Validate orderId to prevent path traversal
//   if (!orderId || !/^[a-zA-Z0-9]+$/.test(orderId)) {
//     return next(new Error('Invalid order ID'));
//   }
//   const invoiceName = "invoice-" + orderId + ".pdf";
//   const invoicePath = path.join('data', 'invoices', invoiceName);
//   Order.findById(orderId).then( order => {
//     if(!order) {
//       return next(new Error('No order found.'))
//     }
//     if(order.user.userId.toString() !== req.user._id.toString()) {
//       return new Error('Unauthorized');
//     }
//     //     fs.readFile(invoicePath, (err, data)=>{
//     //     if(err){
//     //       return next(err);
//     //     }
//     //     res.setHeader("Content-Type", "application/pdf")
//     //     res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"');
//     //     res.send(data);
//     // });
//     //recommended way for bigger files - streaming 
//     // const file = fs.createReadStream(invoicePath);
//     res.setHeader("Content-Type", "application/pdf")
//     res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"');

//     const pdfDocument = new PDFDocument();
//     pdfDocument.pipe(fs.createWriteStream(invoicePath));
//     pdfDocument.pipe(res);
//     pdfDocument.text("Hello files");

//     pdfDocument.fontSize(26).text('Invoice', {
//       underline: true
//     })

//     pdfDocument.text("---------------------")
//     let totalPrice = 0;
//     order.products.forEach(product => {
//       totalPrice += (product.quantity * product.product.price)
//       pdfDocument.text(product.product.title + ' - ' + product.quantity + ' x' + '$' + product.product.price)
//     })
//     pdfDocument.text(`Total Price: ${totalPrice}`)
//     pdfDocument.end();


//   }).catch(err => {
//       const error = new Error(err);
//       error.httpStatusCode = 500;
//       return next(error);
//   });

// }