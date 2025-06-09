const Product = require("../models/products");

const getProducts = async () => {
    try {
        const products = await Product.find();
        return products;
    } catch (error) {
        throw new Error(error.message);
    }
}

const getProductById = async (id) => {
    try {
        const products = await Product.findById(id);
        return products;
    }
    catch (error) {
        throw new Error(error.message);
    }
}

const createProduct = async (productData) => {
    try {
        const newProduct = new Product(productData);
        const createdProduct = await newProduct.save();
        return createdProduct;
    } catch (error) {
        throw new Error(error.message);
    }
};

const updateProduct = async (id, productData) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(id, productData, { new: true });
        return updatedProduct;
    } catch (error) {
        throw new Error(error.message);
    }
};

const deleteProduct = async (id) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(id);
        return deletedProduct;
    } catch (error) {
        throw new Error(error.message);
    }
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};