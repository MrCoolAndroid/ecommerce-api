const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../models/users');
const usersController = require('../controllers/usersController');
const bcrypt = require('bcryptjs');

jest.mock('../services/generateToken', () => jest.fn(() => 'mocked-token'));

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

describe('usersController', () => {
    describe('register', () => {
        it('should return 400 if email already registered', async () => {
            await User.create({ name: 'Test', email: 'test@test.com', passwordHash: 'hash', role: 'user' });
            const req = { body: { name: 'Test', email: 'test@test.com', password: 'password123', role: 'user' } };
            const res = { error: jest.fn(), success: jest.fn() };
            require('express-validator').validationResult = () => ({
                isEmpty: () => true
            });
            await usersController.register(req, res);
            expect(res.error).toHaveBeenCalledWith('E-mail already registered', 400);
        });

        it('should register user and return token if data is valid', async () => {
            const req = { body: { name: 'Test', email: 'newuser@test.com', password: 'password123', role: 'user' } };
            const res = { error: jest.fn(), success: jest.fn() };
            require('express-validator').validationResult = () => ({
                isEmpty: () => true
            });
            await usersController.register(req, res);
            expect(res.success).toHaveBeenCalledWith(
                expect.objectContaining({
                    token: 'mocked-token',
                    user: expect.objectContaining({
                        id: expect.anything(),
                        role: 'user'
                    })
                }),
                201
            );
        });
    });

    describe('login', () => {
        it('should return 401 if user not found', async () => {
            const req = { body: { email: 'nouser@test.com', password: 'password123' } };
            const res = { error: jest.fn(), success: jest.fn() };
            require('express-validator').validationResult = () => ({
                isEmpty: () => true
            });
            await usersController.login(req, res);
            expect(res.error).toHaveBeenCalledWith('Invalid credentials', 401);
        });

        it('should return 401 if password is incorrect', async () => {
            const passwordHash = await bcrypt.hash('correctpassword', 10);
            await User.create({ name: 'Test', email: 'user@test.com', passwordHash, role: 'user' });
            const req = { body: { email: 'user@test.com', password: 'wrongpassword' } };
            const res = { error: jest.fn(), success: jest.fn() };
            require('express-validator').validationResult = () => ({
                isEmpty: () => true
            });
            await usersController.login(req, res);
            expect(res.error).toHaveBeenCalledWith('Invalid credentials', 401);
        });

        it('should login and return token if credentials are correct', async () => {
            const password = 'password123';
            const passwordHash = await bcrypt.hash(password, 10);
            await User.create({ name: 'Test', email: 'loginuser@test.com', passwordHash, role: 'user' });
            const req = { body: { email: 'loginuser@test.com', password } };
            const res = { error: jest.fn(), success: jest.fn() };
            require('express-validator').validationResult = () => ({
                isEmpty: () => true
            });
            await usersController.login(req, res);
            expect(res.success).toHaveBeenCalledWith(
                expect.objectContaining({
                    token: 'mocked-token',
                    user: expect.objectContaining({
                        id: expect.anything(),
                        role: 'user'
                    })
                })
            );
        });
    });
});