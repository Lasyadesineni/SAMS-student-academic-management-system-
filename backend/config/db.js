const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const connUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sams_db';
    console.log(`Connecting to MongoDB at: ${connUri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@')}...`);
    
    const conn = await mongoose.connect(connUri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`MongoDB Connected successfully: ${conn.connection.host} / ${conn.connection.name}`);
    
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB runtime connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting to reconnect...');
    });

    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
