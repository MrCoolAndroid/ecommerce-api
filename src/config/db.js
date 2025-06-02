const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/ecommerce_db'
    try {
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB');
    } catch(error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
};
module.exports = connectDB;