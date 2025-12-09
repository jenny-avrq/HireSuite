const mongoose = require('mongoose');

const uri = "mongodb://localhost:27017/HireSuite";

const connectDB = async () => {
    try {
        await mongoose.connect(uri);
        console.log('MongoDB Connected!');
    } catch (err) {
        console.error('MongoDB Connection Error:', err);
        process.exit(1); // Stop the app if the connection fails
    }
}

module.exports = connectDB;