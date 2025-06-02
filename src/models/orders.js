const mongoose = require('mongoose');
const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    products: [
        {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
            quantity: { type: Number, required: true }
        }
    ],
    totalAmount: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'cancelled', 'sent'], default: 'pending' }
}, { collection: 'orders', timestamps: true });
const orders = mongoose.model('Order', orderSchema);
module.exports = orders;