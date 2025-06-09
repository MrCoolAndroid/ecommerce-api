const { body, validationResult } = require("express-validator");
const { register: registerUser, login: loginUser } = require('../repositories/userRepository');

const register = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.error("Validation errors", 400, errors.array());
    }
    try {
        const { name, email, password, role } = req.body;

        const response = await registerUser(name, email, password, role);

        res.success(response, 201);

    } catch (error) {
        if (error.message.includes("E-mail already registered")) {
            return res.error("E-mail already registered", 400);
        }

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

        const response = await loginUser(email, password);

        res.success(response);

    } catch (error) {
        if (error.message.includes("Invalid credentials")) {
            return res.error("Invalid credentials", 401);
        }
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
