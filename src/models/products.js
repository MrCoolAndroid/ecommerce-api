const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, default: 0 }
}, { collection: 'products', timestamps: true });
const products = mongoose.model('Product', productSchema);
module.exports = products;