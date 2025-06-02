const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Order = require('../models/orders');
const Product = require('../models/products');
const User = require('../models/users');
const ordersController = require('../controllers/ordersController');

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

describe('ordersController', () => {
    describe('getOrders', () => {
        it('must return 404 if user has not been found to fetch orders', async () => {
            const req = { user: { email: 'johndoe@test.com' } };
            const res = { error: jest.fn(), success: jest.fn() };
            await ordersController.getOrders(req, res);
            expect(res.error).toHaveBeenCalledWith('User not found for orders', 404);
        });

        it('must return 404 if no orders have been found for user', async () => {
            await User.create({ name: 'test', email: 'johndoe@test.com', passwordHash: 'random', role: 'user' });
            const req = { user: { email: 'johndoe@test.com' } };
            const res = { error: jest.fn(), success: jest.fn() };
            await ordersController.getOrders(req, res);
            expect(res.error).toHaveBeenCalledWith('No orders found', 404);
        });

        it('must return 404 if no orders have been found at all if an admin', async () => {
            await User.create({ name: 'test', email: 'admin@test.com', passwordHash: 'random', role: 'admin' });
            const req = { user: { email: 'admin@test.com' } };
            const res = { error: jest.fn(), success: jest.fn() };
            await ordersController.getOrders(req, res);
            expect(res.error).toHaveBeenCalledWith('No orders found', 404);
        });

        it('must return user orders if not an admin', async () => {
            const user = await User.create({ name: 'test', email: 'user@test.com', passwordHash: 'random', role: 'user' });
            await Order.create({ userId: user._id, products: [], totalAmount: 0 });
            const req = { user: { email: 'user@test.com' } };
            const res = { error: jest.fn(), success: jest.fn() };
            await ordersController.getOrders(req, res);
            expect(res.success).toHaveBeenCalledWith(expect.any(Array));
        });

        it('must return all orders if an admin', async () => {
            const admin = await User.findOne({ email: 'admin@test.com' });
            await Order.create({ userId: admin._id, products: [], totalAmount: 0 });
            const req = { user: { email: 'admin@test.com' } };
            const res = { error: jest.fn(), success: jest.fn() };
            await ordersController.getOrders(req, res);
            expect(res.success).toHaveBeenCalledWith(expect.any(Array));
        });
    });

    describe('createOrder', () => {
        it('must return 404 if the product to add to the order has not been found', async () => {
            const user = await User.findOne({ email: 'user@test.com' });
            const fakeId = new mongoose.Types.ObjectId();
            const req = {
                body: {
                    userId: user._id.toString(),
                    products: [{ productId: fakeId.toString(), quantity: 1 }]
                }
            };
            const res = { error: jest.fn(), success: jest.fn() };
            require('express-validator').validationResult = () => ({
                isEmpty: () => true
            });
            await ordersController.createOrder(req, res);
            expect(res.error).toHaveBeenCalledWith('Product not found: ' + fakeId.toString(), 404);
        });

        it('must return 400 if the product stock is not enough for the order', async () => {
            const user = await User.findOne({ email: 'user@test.com' });
            const product = await Product.create({ name: 'Test', description: 'test', category: 'category', image: 'http://test.com/image.png', price: 10, stock: 1 });
            const req = {
                body: {
                    userId: user._id.toString(),
                    products: [{ productId: product._id.toString(), quantity: 2 }]
                }
            };
            const res = { error: jest.fn(), success: jest.fn() };
            require('express-validator').validationResult = () => ({
                isEmpty: () => true
            });
            await ordersController.createOrder(req, res);
            expect(res.error).toHaveBeenCalledWith('Insufficient stock for productId: ' + product._id.toString(), 400);
        });

        it('must correctly create an order', async () => {
            const user = await User.create({ name: 'test', email: 'user2@test.com', passwordHash: 'random', role: 'user' });
            const product = await Product.create({ name: 'Test 2', description: 'test', category: 'category', image: 'http://test.com/image.png', price: 10, stock: 5 });
            const req = {
                body: {
                    userId: user._id.toString(),
                    products: [{ productId: product._id.toString(), quantity: 2 }]
                }
            };
            const res = { error: jest.fn(), success: jest.fn() };
            
            require('express-validator').validationResult = () => ({
                isEmpty: () => true
            });
            await ordersController.createOrder(req, res);
            expect(res.success).toHaveBeenCalledWith(expect.any(Object), 201);
        });
    });

    describe('updateOrder', () => {
        it('must return 400 if the status is not in the body', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const req = {
                params: { id: fakeId.toString() },
                body: { }
            };
            const res = { error: jest.fn(), success: jest.fn(), body: req.body };
            await ordersController.updateOrder(req, res);
            expect(res.error).toHaveBeenCalledWith('Status is needed to update', 400);
        });

        it('must return 404 if the order to update has not been found', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const req = {
                params: { id: fakeId.toString() },
                body: { status: 'sent' }
            };
            const res = { error: jest.fn(), success: jest.fn(), body: req.body };
            await ordersController.updateOrder(req, res);
            expect(res.error).toHaveBeenCalledWith('Order not found', 404);
        });

        it('must return 400 if the status is already set to the one in the body', async () => {
            const user = await User.create({ name: 'test', email: 'user3@test.com', passwordHash: 'random', role: 'user' });
            const product = await Product.create({ name: 'Test 3', description: 'test', category: 'category', image: 'http://test.com/image.png', price: 20, stock: 10 });
            const order = await Order.create({
                userId: user._id,
                products: [{ productId: product._id, quantity: 1 }],
                totalAmount: 20,
                status: 'pending'
            });
            const req = {
                params: { id: order._id.toString() },
                body: { status: 'pending' }
            };
            const res = { error: jest.fn(), success: jest.fn(), body: req.body };
            await ordersController.updateOrder(req, res);
            expect(res.error).toHaveBeenCalledWith('Order status is already ' + req.body.status.toString(), 400);
        });

        it('must update the status of the order', async () => {
            const user = await User.findOne({ email: 'user3@test.com' });
            const product = await Product.findOne({ name: 'Test 3' });
            const order = await Order.findOne();
            const req = {
                params: { id: order._id.toString() },
                body: { status: 'sent' }
            };
            const res = { error: jest.fn(), success: jest.fn(), body: req.body };
            await ordersController.updateOrder(req, res);
            expect(res.success).toHaveBeenCalled();
        });
    });
});
