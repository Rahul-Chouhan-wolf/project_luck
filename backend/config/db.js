// For Connecting MongoDB
// config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Use environment variable or fallback to hardcoded value
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/connect_dots';
        
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB Connected');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

module.exports = connectDB;