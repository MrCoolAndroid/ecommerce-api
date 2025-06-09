const { body, validationResult } = require("express-validator");
const { getOrders: getAllOrders, getOrdersByUserId, createOrder: createNewOrder, updateOrder: modifyOrder } = require('../repositories/orderRepository');
const User = require("../models/users");

const getOrders = async (req, res) => {
    try {
        const userEmail = req.user.email;
        const user = await User.findOne({ email: userEmail });

        if (!user) {
            return res.error("User not found for orders", 404);
        }

        if (user.role !== "admin") {
            const orders = await getOrdersByUserId(user._id);
            if (!orders || orders.length === 0) {
                return res.error("No orders found", 404);
            }
            return res.success(orders);
        }

        const orders = await getAllOrders();
        if (!orders || orders.length === 0) {
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
    try {
        const createdOrder = await createNewOrder(req.body);
        return res.success(createdOrder, 201);
    } catch (err) {
        if (err.message.includes("Product not found")) {
            return res.error(err.message, 404);
        }
        if (err.message.includes("Insufficient stock")) {
            return res.error(err.message, 400);
        }
        return res.error("Error while trying to create order: " + err, 500);
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

        const updatedOrder = await modifyOrder(id, req.body);
        if (!updatedOrder || updatedOrder.length === 0) {
            return res.error("Order not found", 404);
        }
        return res.success(updatedOrder);
    } catch (err) {
        if (err.message.includes("Order status is already")) {
            return res.error(err.message, 400);
        }
        if (err.message.includes("Product not found")) {
            return res.error(err.message, 404);
        }
        if (err.message.includes("Insufficient stock")) {
            return res.error(err.message, 400);
        }
        return res.error("Error while trying to update order " + err, 500);
    }
}

module.exports = {
    getOrders,
    validateOrder,
    createOrder,
    updateOrder
}