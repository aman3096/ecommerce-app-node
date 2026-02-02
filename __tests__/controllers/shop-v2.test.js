const shopController = require('../../controllers/shop-v2');
const Product = require('../../models/product');
const User = require('../../models/user');
const Order = require('../../models/order');
const constants = require('../../util/constants');

// Mock the models
jest.mock('../../models/product');
jest.mock('../../models/user');
jest.mock('../../models/order');

describe('Shop V2 Controllers', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      query: {},
      params: {},
      body: {},
      user: {}
    };
    res = {
      json: jest.fn().mockReturnThis(),
      redirect: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  // ==================== getProductsV2 Tests ====================
  describe('getProductsV2', () => {
    it('should return products with pagination data', async () => {
      const mockProducts = [
        { _id: '1', title: 'Product 1', price: 10 },
        { _id: '2', title: 'Product 2', price: 20 }
      ];
      
      req.query.page = 1;
      Product.find.mockReturnValue({
        countDocuments: jest.fn().mockResolvedValue(25),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockProducts)
      });
      Product.find().countDocuments.mockResolvedValue(25);

      await shopController.getProductsV2(req, res, next);

      expect(res.json).toHaveBeenCalled();
      const response = res.json.mock.calls[0][0];
      expect(response.prods).toEqual(mockProducts);
      expect(response.currentPage).toBe(1);
      expect(response.hasNextPage).toBe(true);
      expect(response.lastPage).toBe(Math.ceil(25 / constants.ITEMS_PER_PAGE));
    });

    it('should default to page 1 if no page query provided', async () => {
      const mockProducts = [];
      
      Product.find.mockReturnValue({
        countDocuments: jest.fn().mockResolvedValue(0),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockProducts)
      });
      Product.find().countDocuments.mockResolvedValue(0);

      await shopController.getProductsV2(req, res, next);

      expect(res.json).toHaveBeenCalled();
      const response = res.json.mock.calls[0][0];
      expect(response.currentPage).toBe(1);
    });

    it('should handle pagination correctly on page 2', async () => {
      const mockProducts = [];
      req.query.page = 2;

      Product.find.mockReturnValue({
        countDocuments: jest.fn().mockResolvedValue(50),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockProducts)
      });
      Product.find().countDocuments.mockResolvedValue(50);

      await shopController.getProductsV2(req, res, next);

      expect(res.json).toHaveBeenCalled();
      const response = res.json.mock.calls[0][0];
      expect(response.currentPage).toBe(2);
      expect(response.nextPage).toBe(3);
      expect(response.previousPage).toBe(1);
      expect(response.hasPreviousPage).toBe(true);
    });

    it('should handle database errors', async () => {
      const error = new Error('DB Error');
      Product.find.mockReturnValue({
        countDocuments: jest.fn().mockRejectedValue(error)
      });

      await shopController.getProductsV2(req, res, next);

      expect(next).toHaveBeenCalled();
      const passedError = next.mock.calls[0][0];
      expect(passedError.httpStatusCode).toBe(500);
    });
  });

  // ==================== getProductV2 Tests ====================
  describe('getProductV2', () => {
    it('should return a single product by ID', async () => {
      const mockProduct = {
        _id: '123',
        title: 'Test Product',
        price: 100,
        description: 'Test Description'
      };

      req.params.productId = '123';
      req.query.page = 1;
      Product.findById.mockResolvedValue(mockProduct);

      await shopController.getProductV2(req, res, next);

      expect(res.json).toHaveBeenCalled();
      const response = res.json.mock.calls[0][0];
      expect(response.product).toEqual(mockProduct);
      expect(response.pageTitle).toBe(mockProduct.title);
    });

    it('should handle product not found', async () => {
      req.params.productId = '999';
      req.query.page = 1;
      Product.findById.mockResolvedValue(null);

      await shopController.getProductV2(req, res, next);

      expect(res.json).toHaveBeenCalled();
      const response = res.json.mock.calls[0][0];
      expect(response.product).toBeNull();
    });

    it('should handle database errors', async () => {
      const error = new Error('DB Error');
      req.params.productId = '123';
      Product.findById.mockRejectedValue(error);

      await shopController.getProductV2(req, res, next);

      expect(next).toHaveBeenCalled();
      const passedError = next.mock.calls[0][0];
      expect(passedError.httpStatusCode).toBe(500);
    });
  });

  // ==================== getIndexV2 Tests ====================
  describe('getIndexV2', () => {
    it('should return all products for index page', async () => {
      const mockProducts = [
        { _id: '1', title: 'Product 1', price: 10 },
        { _id: '2', title: 'Product 2', price: 20 }
      ];

      Product.find.mockReturnValue({
        countDocuments: jest.fn().mockResolvedValue(2)
      });
      Product.find().countDocuments.mockResolvedValue(2);
      Product.find.mockResolvedValue(mockProducts);

      await shopController.getIndexV2(req, res, next);

      expect(res.json).toHaveBeenCalled();
      const response = res.json.mock.calls[0][0];
      expect(response.prods).toEqual(mockProducts);
      expect(response.pageTitle).toBe('Shop');
      expect(response.path).toBe('/');
    });

    it('should handle empty product list', async () => {
      Product.find.mockReturnValue({
        countDocuments: jest.fn().mockResolvedValue(0)
      });
      Product.find().countDocuments.mockResolvedValue(0);
      Product.find.mockResolvedValue([]);

      await shopController.getIndexV2(req, res, next);

      expect(res.json).toHaveBeenCalled();
      const response = res.json.mock.calls[0][0];
      expect(response.prods).toEqual([]);
    });

    it('should handle database errors', async () => {
      const error = new Error('DB Error');
      Product.find.mockReturnValue({
        countDocuments: jest.fn().mockRejectedValue(error)
      });

      await shopController.getIndexV2(req, res, next);

      expect(next).toHaveBeenCalled();
      const passedError = next.mock.calls[0][0];
      expect(passedError.httpStatusCode).toBe(500);
    });
  });

  // ==================== getCartV2 Tests ====================
  describe('getCartV2', () => {
    it('should return user cart with populated product details', async () => {
      const mockUser = {
        _id: 'user123',
        cart: {
          items: [
            {
              productId: {
                _id: 'prod1',
                title: 'Product 1',
                price: 10
              },
              quantity: 2
            }
          ]
        }
      };

      req.params.userId = 'user123';
      User.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockUser)
      });

      await shopController.getCartV2(req, res, next);

      expect(res.json).toHaveBeenCalled();
      const response = res.json.mock.calls[0][0];
      expect(response.products).toHaveLength(1);
      expect(response.products[0].title).toBe('Product 1');
      expect(response.products[0].quantity).toBe(2);
    });

    it('should handle empty cart', async () => {
      const mockUser = {
        _id: 'user123',
        cart: { items: [] }
      };

      req.params.userId = 'user123';
      User.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockUser)
      });

      await shopController.getCartV2(req, res, next);

      expect(res.json).toHaveBeenCalled();
      const response = res.json.mock.calls[0][0];
      expect(response.products).toEqual([]);
    });

    it('should handle user not found', async () => {
      req.params.userId = 'invalid';
      User.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null)
      });

      await shopController.getCartV2(req, res, next);

      // Even if null, map will fail - error should be caught
      expect(next).toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      const error = new Error('DB Error');
      req.params.userId = 'user123';
      User.findById.mockReturnValue({
        populate: jest.fn().mockRejectedValue(error)
      });

      await shopController.getCartV2(req, res, next);

      expect(next).toHaveBeenCalled();
      const passedError = next.mock.calls[0][0];
      expect(passedError.httpStatusCode).toBe(500);
    });
  });

  // ==================== postCartV2 Tests ====================
  describe('postCartV2', () => {
    it('should add new item to cart', async () => {
      const mockProduct = { _id: 'prod1', title: 'Product 1', price: 100 };
      const mockUser = {
        _id: 'user1',
        email: 'test@example.com',
        cart: { items: [] },
        save: jest.fn().mockResolvedValue(true),
        populate: jest.fn().mockReturnThis()
      };
      mockUser.populate.mockResolvedValue(mockUser);

      req.body = {
        productId: 'prod1',
        quantity: 2,
        email: 'test@example.com'
      };

      Product.findById.mockResolvedValue(mockProduct);
      User.findOne.mockResolvedValue(mockUser);

      await shopController.postCartV2(req, res, next);

      expect(mockUser.cart.items).toHaveLength(1);
      expect(mockUser.cart.items[0].quantity).toBe(2);
      expect(mockUser.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalled();
    });

    it('should increment quantity if product already in cart', async () => {
      const mockProduct = { _id: 'prod1', title: 'Product 1', price: 100 };
      const mockUser = {
        _id: 'user1',
        email: 'test@example.com',
        cart: {
          items: [
            { productId: 'prod1', quantity: 1 }
          ]
        },
        save: jest.fn().mockResolvedValue(true),
        populate: jest.fn().mockReturnThis()
      };
      mockUser.populate.mockResolvedValue(mockUser);

      req.body = {
        productId: 'prod1',
        quantity: 3,
        email: 'test@example.com'
      };

      Product.findById.mockResolvedValue(mockProduct);
      User.findOne.mockResolvedValue(mockUser);

      await shopController.postCartV2(req, res, next);

      expect(mockUser.cart.items[0].quantity).toBe(4);
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('should default quantity to 1 if not provided', async () => {
      const mockProduct = { _id: 'prod1', title: 'Product 1', price: 100 };
      const mockUser = {
        _id: 'user1',
        email: 'test@example.com',
        cart: { items: [] },
        save: jest.fn().mockResolvedValue(true),
        populate: jest.fn().mockReturnThis()
      };
      mockUser.populate.mockResolvedValue(mockUser);

      req.body = {
        productId: 'prod1',
        email: 'test@example.com'
      };

      Product.findById.mockResolvedValue(mockProduct);
      User.findOne.mockResolvedValue(mockUser);

      await shopController.postCartV2(req, res, next);

      expect(mockUser.cart.items[0].quantity).toBe(1);
    });

    it('should return 404 if product not found', async () => {
      req.body = {
        productId: 'invalid',
        quantity: 1,
        email: 'test@example.com'
      };

      Product.findById.mockResolvedValue(null);

      await shopController.postCartV2(req, res, next);

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error.message).toBe('Product not found');
      expect(error.httpStatusCode).toBe(404);
    });

    it('should return 404 if user not found', async () => {
      const mockProduct = { _id: 'prod1', title: 'Product 1', price: 100 };
      
      req.body = {
        productId: 'prod1',
        quantity: 1,
        email: 'invalid@example.com'
      };

      Product.findById.mockResolvedValue(mockProduct);
      User.findOne.mockResolvedValue(null);

      await shopController.postCartV2(req, res, next);

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error.message).toBe('User not found');
      expect(error.httpStatusCode).toBe(404);
    });

    it('should handle database errors', async () => {
      const error = new Error('DB Error');
      req.body = {
        productId: 'prod1',
        quantity: 1,
        email: 'test@example.com'
      };

      Product.findById.mockRejectedValue(error);

      await shopController.postCartV2(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  // ==================== emptyCartV2 Tests ====================
  describe('emptyCartV2', () => {
    it('should clear all items from cart', async () => {
      const mockProduct = { _id: 'prod1' };
      const mockUser = {
        _id: 'user1',
        email: 'test@example.com',
        cart: {
          items: [
            { productId: 'prod1', quantity: 2 }
          ]
        },
        save: jest.fn().mockResolvedValue(true)
      };

      req.body = {
        productId: 'prod1',
        email: 'test@example.com'
      };

      Product.findById.mockResolvedValue(mockProduct);
      User.findOne.mockResolvedValue(mockUser);

      await shopController.emptyCartV2(req, res, next);

      expect(mockUser.cart.items).toEqual([]);
      expect(mockUser.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalled();
      const response = res.json.mock.calls[0][0];
      expect(response.status).toBe(200);
      expect(response.message).toBe('Cart is Empty now');
    });

    it('should return 404 if product not found', async () => {
      req.body = {
        productId: 'invalid',
        email: 'test@example.com'
      };

      Product.findById.mockResolvedValue(null);

      await shopController.emptyCartV2(req, res, next);

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error.httpStatusCode).toBe(404);
    });

    it('should return 404 if user not found', async () => {
      const mockProduct = { _id: 'prod1' };
      
      req.body = {
        productId: 'prod1',
        email: 'invalid@example.com'
      };

      Product.findById.mockResolvedValue(mockProduct);
      User.findOne.mockResolvedValue(null);

      await shopController.emptyCartV2(req, res, next);

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error.httpStatusCode).toBe(404);
    });

    it('should handle database errors', async () => {
      const error = new Error('DB Error');
      req.body = {
        productId: 'prod1',
        email: 'test@example.com'
      };

      Product.findById.mockRejectedValue(error);

      await shopController.emptyCartV2(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  // ==================== postCartDeleteProductV2 Tests ====================
  describe('postCartDeleteProductV2', () => {
    it('should remove product from cart', async () => {
      const mockProduct = { _id: 'prod1' };
      const mockUser = {
        _id: 'user1',
        email: 'test@example.com',
        cart: {
          items: [
            { productId: 'prod1', quantity: 2 },
            { productId: 'prod2', quantity: 1 }
          ]
        },
        save: jest.fn().mockResolvedValue(true)
      };

      req.body = {
        productId: 'prod1',
        email: 'test@example.com'
      };

      Product.findById.mockResolvedValue(mockProduct);
      User.findOne.mockResolvedValue(mockUser);

      await shopController.postCartDeleteProductV2(req, res, next);

      expect(mockUser.cart.items).toHaveLength(1);
      expect(mockUser.cart.items[0].productId).toBe('prod2');
      expect(mockUser.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalled();
      const response = res.json.mock.calls[0][0];
      expect(response.message).toBe('Cart Item Removed Successfully');
    });

    it('should handle removing non-existent product', async () => {
      const mockProduct = { _id: 'prod3' };
      const mockUser = {
        _id: 'user1',
        email: 'test@example.com',
        cart: {
          items: [
            { productId: 'prod1', quantity: 2 }
          ]
        },
        save: jest.fn().mockResolvedValue(true)
      };

      req.body = {
        productId: 'prod3',
        email: 'test@example.com'
      };

      Product.findById.mockResolvedValue(mockProduct);
      User.findOne.mockResolvedValue(mockUser);

      await shopController.postCartDeleteProductV2(req, res, next);

      expect(mockUser.cart.items).toHaveLength(1);
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('should return 404 if product not found', async () => {
      req.body = {
        productId: 'invalid',
        email: 'test@example.com'
      };

      Product.findById.mockResolvedValue(null);

      await shopController.postCartDeleteProductV2(req, res, next);

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error.httpStatusCode).toBe(404);
    });

    it('should return 404 if user not found', async () => {
      const mockProduct = { _id: 'prod1' };
      
      req.body = {
        productId: 'prod1',
        email: 'invalid@example.com'
      };

      Product.findById.mockResolvedValue(mockProduct);
      User.findOne.mockResolvedValue(null);

      await shopController.postCartDeleteProductV2(req, res, next);

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error.httpStatusCode).toBe(404);
    });

    it('should handle database errors', async () => {
      const error = new Error('DB Error');
      req.body = {
        productId: 'prod1',
        email: 'test@example.com'
      };

      Product.findById.mockRejectedValue(error);

      await shopController.postCartDeleteProductV2(req, res, next);

      expect(next).toHaveBeenCalled();
      const passedError = next.mock.calls[0][0];
      expect(passedError.httpStatusCode).toBe(500);
    });
  });

  // ==================== getOrdersV2 Tests ====================
  describe('getOrdersV2', () => {
    it('should return orders for a specific email', async () => {
      const mockOrders = [
        {
          _id: 'order1',
          email: 'test@example.com',
          products: [{ title: 'Product 1', quantity: 2, price: 100 }],
          user: 'user1',
          date: new Date('2024-01-01')
        },
        {
          _id: 'order2',
          email: 'test@example.com',
          products: [{ title: 'Product 2', quantity: 1, price: 50 }],
          user: 'user1',
          date: new Date('2024-01-02')
        }
      ];

      req.body.email = 'test@example.com';
      Order.find.mockResolvedValue(mockOrders);

      await shopController.getOrdersV2(req, res, next);

      expect(Order.find).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(res.json).toHaveBeenCalled();
      const response = res.json.mock.calls[0][0];
      expect(response.orders).toEqual(mockOrders);
      expect(response.orders).toHaveLength(2);
      expect(response.pageTitle).toBe('Your Orders');
      expect(response.path).toBe('/orders');
    });

    it('should return empty array when user has no orders', async () => {
      req.body.email = 'newuser@example.com';
      Order.find.mockResolvedValue([]);

      await shopController.getOrdersV2(req, res, next);

      expect(Order.find).toHaveBeenCalledWith({ email: 'newuser@example.com' });
      expect(res.json).toHaveBeenCalled();
      const response = res.json.mock.calls[0][0];
      expect(response.orders).toEqual([]);
    });

    it('should return single order for email with one order', async () => {
      const mockOrder = [
        {
          _id: 'order1',
          email: 'test@example.com',
          products: [{ title: 'Product 1', quantity: 2, price: 100 }],
          user: 'user1',
          date: new Date('2024-01-01')
        }
      ];

      req.body.email = 'test@example.com';
      Order.find.mockResolvedValue(mockOrder);

      await shopController.getOrdersV2(req, res, next);

      expect(res.json).toHaveBeenCalled();
      const response = res.json.mock.calls[0][0];
      expect(response.orders).toHaveLength(1);
      expect(response.orders[0]._id).toBe('order1');
    });

    it('should not trigger orders not found for empty array', async () => {
      req.body.email = 'test@example.com';
      Order.find.mockResolvedValue([]);

      await shopController.getOrdersV2(req, res, next);

      // MongoDB find returns empty array, not null, so the if(!orders) check will never trigger
      expect(res.json).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('should trigger 404 when orders query returns null (edge case)', async () => {
      req.body.email = 'test@example.com';
      Order.find.mockResolvedValue(null);

      await shopController.getOrdersV2(req, res, next);

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error.message).toBe('Orders not found');
      expect(error.httpStatusCode).toBe(404);
    });

    it('should handle database errors', async () => {
      const error = new Error('DB Connection Error');
      req.body.email = 'test@example.com';
      Order.find.mockRejectedValue(error);

      await shopController.getOrdersV2(req, res, next);

      expect(next).toHaveBeenCalled();
      const passedError = next.mock.calls[0][0];
      expect(passedError.httpStatusCode).toBe(500);
    });

    it('should work with different email formats', async () => {
      const mockOrders = [
        {
          _id: 'order1',
          email: 'user.name+test@example.com',
          products: [],
          user: 'user1'
        }
      ];

      req.body.email = 'user.name+test@example.com';
      Order.find.mockResolvedValue(mockOrders);

      await shopController.getOrdersV2(req, res, next);

      expect(Order.find).toHaveBeenCalledWith({ email: 'user.name+test@example.com' });
      expect(res.json).toHaveBeenCalled();
      const response = res.json.mock.calls[0][0];
      expect(response.orders).toHaveLength(1);
    });

    it('should return orders with complete product details', async () => {
      const mockOrders = [
        {
          _id: 'order1',
          email: 'test@example.com',
          products: [
            { productId: 'prod1', title: 'Laptop', quantity: 1, price: 1000 },
            { productId: 'prod2', title: 'Mouse', quantity: 2, price: 25 }
          ],
          user: 'user1',
          totalAmount: 1050,
          date: new Date('2024-01-01')
        }
      ];

      req.body.email = 'test@example.com';
      Order.find.mockResolvedValue(mockOrders);

      await shopController.getOrdersV2(req, res, next);

      expect(res.json).toHaveBeenCalled();
      const response = res.json.mock.calls[0][0];
      expect(response.orders[0].products).toHaveLength(2);
      expect(response.orders[0].products[0].title).toBe('Laptop');
      expect(response.orders[0].products[1].title).toBe('Mouse');
    });

    it('should handle missing email in request body', async () => {
      req.body = {};
      Order.find.mockResolvedValue([]);

      await shopController.getOrdersV2(req, res, next);

      expect(Order.find).toHaveBeenCalledWith({ email: undefined });
      expect(res.json).toHaveBeenCalled();
    });

    it('should handle null email gracefully', async () => {
      req.body.email = null;
      Order.find.mockResolvedValue([]);

      await shopController.getOrdersV2(req, res, next);

      expect(Order.find).toHaveBeenCalledWith({ email: null });
      expect(res.json).toHaveBeenCalled();
    });

    it('should return correct response structure', async () => {
      const mockOrders = [
        {
          _id: 'order1',
          email: 'test@example.com',
          products: [],
          user: 'user1'
        }
      ];

      req.body.email = 'test@example.com';
      Order.find.mockResolvedValue(mockOrders);

      await shopController.getOrdersV2(req, res, next);

      expect(res.json).toHaveBeenCalled();
      const response = res.json.mock.calls[0][0];
      expect(response).toHaveProperty('path', '/orders');
      expect(response).toHaveProperty('pageTitle', 'Your Orders');
      expect(response).toHaveProperty('orders');
    });

    it('should handle multiple orders from same user correctly', async () => {
      const mockOrders = [
        { _id: 'order1', email: 'test@example.com', products: [] },
        { _id: 'order2', email: 'test@example.com', products: [] },
        { _id: 'order3', email: 'test@example.com', products: [] },
        { _id: 'order4', email: 'test@example.com', products: [] },
        { _id: 'order5', email: 'test@example.com', products: [] }
      ];

      req.body.email = 'test@example.com';
      Order.find.mockResolvedValue(mockOrders);

      await shopController.getOrdersV2(req, res, next);

      expect(res.json).toHaveBeenCalled();
      const response = res.json.mock.calls[0][0];
      expect(response.orders).toHaveLength(5);
    });
  });
});
