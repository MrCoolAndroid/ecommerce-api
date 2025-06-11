const Order = require("../models/orders");
const { getProductById, updateProduct } = require("./productRepository");
const Product = require("../models/products");
const User = require("../models/users");

const getOrdersByUserId = async (userId) => {
    try {
        const orders = await Order.find({ userId: userId });
        return orders;
    } catch (error) {
        throw new Error(error.message);
    }
}

const getOrders = async () => {
    try {
        const orders = await Order.find();
        return orders;
    } catch (error) {
        throw new Error(error.message);
    }
}

const createOrder = async (orderData) => {
    try {
        const { userId, products } = orderData;
        let totalAmount = 0;

        for (const product of products) {
            const productData = await getProductById(product.productId);

            if (!productData) {
                throw new Error("Product not found: " + product.productId);
            }
            if (productData.stock < product.quantity) {
                throw new Error("Insufficient stock for productId: " + product.productId);
            }

            productData.stock -= product.quantity;
            await updateProduct(productData._id, { stock: productData.stock });

            totalAmount += productData.price * product.quantity;
        }

        const newOrder = new Order({ userId, products, totalAmount });
        await newOrder.save();

        return newOrder;
    } catch (error) {
        if (error.message.includes("Product not found")) {
            throw new Error(error.message);
        }
        throw new Error(error.message);
    }
}

const updateOrder = async (id, orderData) => {
    try {
        const order = await Order.findById(id);
        if (!order) {
            return order;
        }

        if (orderData.status === order.status) {
            throw new Error("Order status is already " + orderData.status);
        }

        if (orderData.status === "cancelled") {
            for (const product of order.products) {
                const productData = await getProductById(product.productId);
                if (!productData) {
                    throw new Error("Product not found: " + product.productId);
                }
                productData.stock += product.quantity;
                await updateProduct(productData._id, { stock: productData.stock });
            }
        }

        if (orderData.status === "sent" || orderData.status === "pending") {
            for (const product of order.products) {
                const productData = await getProductById(product.productId);
                if (!productData) {
                    throw new Error("Product not found: " + product.productId);
                }
                if (productData.stock < product.quantity) {
                    throw new Error("Insufficient stock for productId: " + product.productId);
                }
                productData.stock -= product.quantity;
                await updateProduct(productData._id, { stock: productData.stock });
            }
        }

        const updatedOrder = await Order.updateOne({ _id: id }, { $set: { status: orderData.status } }, { new: true });
        return updatedOrder;
    }
    catch (error) {
        throw new Error(error.message);
    }
}

module.exports = {
    getOrdersByUserId,
    getOrders,
    createOrder,
    updateOrder
};