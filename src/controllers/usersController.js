const User = require('../models/users');
const { body, validationResult } = require("express-validator");
const bcrypt = require('bcryptjs');
const generateToken = require('../services/generateToken');

const register = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.error("Validation errors", 400, errors.array());
    }
    try {
        const { name, email, password, role } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) return res.error("E-mail already registered", 400);

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            passwordHash: hashedPassword,
            role: role || 'user'
        });

        const token = generateToken(user);

        res.success({ token, user: { id: user._id, username: user.username, role: user.role } }, 201);

    } catch (error) {
        res.error("Error while trying to register. " + error, 500);
    }
};

const login = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.error("Validation errors", 400, errors.array());
    }
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.error("Invalid credentials", 401);

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) return res.error("Invalid credentials", 401);

        const token = generateToken(user);

        res.success({ token, user: { id: user._id, username: user.username, role: user.role } });

    } catch (error) {
        res.error("Error while trying to sign in", 500);
    }
};

const validateRegister = [
    body("name")
        .trim()
        .notEmpty().withMessage("Name is required")
        .isLength({ max: 150 }).withMessage("Max length is 150"),
    body("email")
        .trim()
        .notEmpty().withMessage("E-mail is required")
        .isEmail().withMessage("Invalid e-mail format"),
    body("password")
        .trim()
        .notEmpty().withMessage("Password is required")
        .isLength({ min: 6 }).withMessage("Minimum length is 6 characters"),
    body("role")
        .optional()
        .isIn(['user', 'admin']).withMessage("Role must be either 'user' or 'admin'")
];

const validateLogin = [
    body("email")
        .trim()
        .notEmpty().withMessage("E-mail is required")
        .isEmail().withMessage("Invalid e-mail format"),
    body("password")
        .trim()
        .notEmpty().withMessage("Password is required")
        .isLength({ min: 6 }).withMessage("Minimum length is 6 characters")
];

module.exports = { register, login, validateRegister, validateLogin };
