# Shop V2 Controller Test Suite

Comprehensive test cases for all shop-v2.js controllers.

## Test Coverage

### Controllers Tested
1. **getProductsV2** - Get products with pagination
2. **getProductV2** - Get single product by ID
3. **getIndexV2** - Get index/shop page
4. **getCartV2** - Get user's cart
5. **postCartV2** - Add items to cart
6. **emptyCartV2** - Clear entire cart
7. **postCartDeleteProductV2** - Remove product from cart

### Test Categories

#### Each controller includes:
- ✅ **Happy path** - Successful operations
- ✅ **Error cases** - 404, 500 errors
- ✅ **Edge cases** - Empty data, null values, defaults
- ✅ **Database errors** - Error handling
- ✅ **Input validation** - Type coercion, defaults

## Running Tests

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## Test Statistics

- **Total Test Cases**: 50+
- **Controllers**: 7
- **Assertions**: 100+

## Key Test Scenarios

### postCartV2 Tests
- Add new item to cart
- Increment existing item quantity
- Default quantity to 1 if not provided
- Return 404 if product not found
- Return 404 if user not found
- Handle database errors

### getCartV2 Tests
- Return populated cart items
- Handle empty cart
- Handle user not found
- Handle database errors

### postCartDeleteProductV2 Tests
- Remove product from cart
- Handle removing non-existent product
- Return 404 if product not found
- Return 404 if user not found

### getProductsV2 Tests
- Return paginated products
- Default to page 1
- Calculate pagination correctly
- Handle database errors

### getProductV2 Tests
- Return single product
- Handle product not found
- Handle database errors

### getIndexV2 Tests
- Return all products
- Handle empty product list
- Handle database errors

### emptyCartV2 Tests
- Clear all cart items
- Return 404 if product not found
- Return 404 if user not found
- Handle database errors

## Mocking Strategy

All database models are mocked using Jest:
- `Product` - Product model
- `User` - User model
- `Order` - Order model

This allows tests to run without a database connection.

## Coverage Goals

- Line Coverage: 50%+
- Branch Coverage: 50%+
- Function Coverage: 50%+
- Statement Coverage: 50%+

## Notes

- Tests use Jest's mocking capabilities
- `req`, `res`, and `next` are manually mocked for each test
- Database operations are stubbed to simulate various scenarios
- Error handling is thoroughly tested
