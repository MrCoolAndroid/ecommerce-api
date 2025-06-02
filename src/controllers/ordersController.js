const { body, validationResult } = require("express-validator");
const Order = require("../models/orders");
const Product = require("../models/products");
const User = require("../models/users");

const getOrders = async (req, res) => {
    try {
        const userEmail = req.user.email;
        const user = await User.findOne({ email: userEmail });

        if (!user) {
            return res.error("User not found for orders", 404);
        }

        if (user.role !== "admin") {
            const orders = await Order.find({ userId: user._id })
            if (orders.length === 0 || orders.length === undefined) {
                return res.error("No orders found", 404);
            }
            return res.success(orders);
        }

        const orders = await Order.find();

        if (orders.length === 0 || orders.length === undefined) {
            return res.error("No orders found", 404);
        }

        return res.success(orders);
    } catch (err) {
        return res.error("Error while trying to get orders", 500);
    }
}

const validateOrder = [
    body("products")
        .notEmpty().withMessage("Products are required")
        .isArray().withMessage("Products must be an array"),
    body("userId")
        .notEmpty().withMessage("User ID is required")
        .isMongoId().withMessage("Invalid User ID format"),
    body("products.*.productId")
        .notEmpty().withMessage("Product ID is required")
        .isMongoId().withMessage("Invalid Product ID format"),
    body("status")
        .optional()
        .isIn(["pending", "cancelled", "sent"]).withMessage("Status must be either sent, cancelled or pending")
];

const createOrder = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.error("Validation errors", 400, errors.array());
    }

    const { products, userId } = req.body;
    let totalAmount = 0;

    for (const product of products) {
        const productData = await Product.findById(product.productId);

        if (!productData) {
            return res.error("Product not found: " + product.productId, 404);
        }
        if (productData.stock < product.quantity) {
            return res.error("Insufficient stock for productId: " + product.productId, 400);
        }

        productData.stock -= product.quantity;
        await productData.save();

        totalAmount += productData.price * product.quantity;
    }

    try {
        const newOrder = new Order({ userId, products, totalAmount });
        await newOrder.save();
        return res.success(newOrder, 201);
    } catch (err) {
        return res.error("Error while trying to create order", 500);
    }
}

const updateOrder = async (req, res) => {
    const { id } = req.params;
    if (!req.body.hasOwnProperty("status")) {
        return res.error("Status is needed to update", 400);
    }
    try {
        if (id.length !== 24) {
            return res.error("Invalid ID format in params", 400);
        }

        const order = await Order.findById(id);

        if (!order) {
            return res.error("Order not found", 404);
        }

        if (req.body.status === order.status) {
            return res.error("Order status is already " + req.body.status, 400);
        }

        if (req.body.status === "cancelled") {
            for (const product of order.products) {
                const productData = await Product.findById(product.productId);
                if (!productData) {
                    return res.error("Product not found: " + product.productId, 404);
                }
                productData.stock += product.quantity;
                await productData.save();
            }
        }

        if (req.body.status === "sent" || req.body.status === "pending") {
            for (const product of order.products) {
                const productData = await Product.findById(product.productId);
                if (!productData) {
                    return res.error("Product not found: " + product.productId, 404);
                }
                if (productData.stock < product.quantity) {
                    return res.error("Insufficient stock for productId: " + product.productId, 400);
                }
                productData.stock -= product.quantity;
                await productData.save();
            }
        }

        const updatedOrder = await Order.updateOne({ _id: id }, { $set: { status: req.body.status }}, { new: true });
        if (!updatedOrder) {
            return res.error("Order not found", 404);
        }

        return res.success(updatedOrder);
    } catch (err) {
        return res.error("Error while trying to update order " + err, 500);
    }
}

module.exports = {
    getOrders,
    validateOrder,
    createOrder,
    updateOrder
}