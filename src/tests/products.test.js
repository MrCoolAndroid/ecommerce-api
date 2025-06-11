const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Product = require('../models/products');
const productsController = require('../controllers/productsController');

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('productsController', () => {
    describe('getProducts', () => {
        it('should return 404 if no products found', async () => {
            const req = {};
            const res = { error: jest.fn(), success: jest.fn() };
            await productsController.getProducts(req, res);
            expect(res.error).toHaveBeenCalledWith('No products found', 404);
        });

        it('should return products if found any', async () => {
            await Product.create({ name: 'Test', description: 'desc', category: 'cat', image: 'http://img.com', price: 10, stock: 5 });
            const req = {};
            const res = { error: jest.fn(), success: jest.fn() };
            await productsController.getProducts(req, res);
            expect(res.success).toHaveBeenCalledWith(expect.any(Array));
        });
    });

    describe('createProduct', () => {
        it('should create product if data is valid', async () => {
            const req = { body: { name: 'Test', description: 'desc', category: 'cat', image: 'http://img.com', price: 10, stock: 5 } };
            const res = { error: jest.fn(), success: jest.fn() };
            require('express-validator').validationResult = () => ({
                isEmpty: () => true
            });
            await productsController.createProduct(req, res);
            expect(res.success).toHaveBeenCalledWith(expect.any(Object), 201);
        });
    });

    describe('updateProduct', () => {
        it('should return 404 if product not found', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const req = { params: { id: fakeId.toString() }, body: { name: 'Updated' } };
            const res = { error: jest.fn(), success: jest.fn() };
            require('express-validator').validationResult = () => ({
                isEmpty: () => true
            });
            await productsController.updateProduct(req, res);
            expect(res.error).toHaveBeenCalledWith('Product not found', 404);
        });

        it('should update product if found and data is valid', async () => {
            const product = await Product.create({ name: 'Test 2', description: 'desc', category: 'cat', image: 'http://img.com', price: 10, stock: 5 });
            const req = { params: { id: product._id.toString() }, body: { name: 'Updated' } };
            const res = { error: jest.fn(), success: jest.fn() };
            require('express-validator').validationResult = () => ({
                isEmpty: () => true
            });
            await productsController.updateProduct(req, res);
            expect(res.success).toHaveBeenCalledWith(expect.objectContaining({ name: 'Updated' }));
        });
    });

    describe('deleteProduct', () => {
        it('should return 404 if product not found', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const req = { params: { id: fakeId.toString() } };
            const res = { error: jest.fn(), success: jest.fn() };
            await productsController.deleteProduct(req, res);
            expect(res.error).toHaveBeenCalledWith('Product not found', 404);
        });

        it('should delete product if found', async () => {
            const product = await Product.create({ name: 'ToDelete', description: 'desc', category: 'cat', image: 'http://img.com', price: 10, stock: 5 });
            const req = { params: { id: product._id.toString() } };
            const res = { error: jest.fn(), success: jest.fn() };
            await productsController.deleteProduct(req, res);
            expect(res.success).toHaveBeenCalledWith(expect.objectContaining({ name: 'ToDelete' }), 204);
        });
    });
});