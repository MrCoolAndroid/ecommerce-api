const { body, validationResult } = require("express-validator");
const Product = require("../models/products");

const getProducts = async(req, res) => {
    try {
        const products = await Product.find();
        if (products.length === 0 || products.length === undefined) {
            return res.error("No products found", 404);
        }
        res.success(products);
    } catch (err) {
        res.error("Error while trying to get products", 500);
    }
};

const validateProduct = [
    body("name")
        .trim()
        .notEmpty().withMessage("Name is required")
        .isLength({ max: 150 }).withMessage("Max lenght is 150"),
    body("description")
        .trim()
        .notEmpty().withMessage("Description is required")
        .isLength({ max: 500 }).withMessage("Max lenght is 500"),
    body("category")
        .trim()
        .notEmpty().withMessage("Category is required")
        .isLength({ max: 100 }).withMessage("Max lenght is 100"),
    body("image")
        .trim()
        .notEmpty().withMessage("Image is required")
        .isURL().withMessage("Invalid URL format"),
    body("price")
        .notEmpty().withMessage("Price is required")
        .isNumeric().withMessage("Price must be a number"),
    body("stock")
        .optional()
        .isNumeric().withMessage("Stock must be a number")
        .isInt({ min: 0 }).withMessage("Stock must be a positive integer")
];

const createProduct = async(req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.error("Validation errors", 400, errors.array());
    }
    try {
        const newProduct = new Product(req.body);
        const createdProduct = await newProduct.save();
        res.success(createdProduct, 201);
    } catch (err) {
        res.error(err.message, 400);
    }
};

const updateProduct = async (req, res) => {
    const { id } = req.params;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.error("Validation errors", 400, errors.array());
    }
    try {
        const updatedProduct = await Product.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedProduct) {
            return res.error("Product not found", 404);
        }
        res.success(updatedProduct);
    } catch (err) {
        res.error(err.message, 400);
    }
}

const deleteProduct = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedProduct = await Product.findByIdAndDelete(id);
        if (!deletedProduct) {
            return res.error("Product not found", 404);
        }
        res.success(deletedProduct, 204);
    } catch (err) {
        res.error(err.message, 400);
    }
}

module.exports = {
    getProducts,
    createProduct,
    validateProduct,
    updateProduct,
    deleteProduct
};