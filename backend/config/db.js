const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    let uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mediqueue';

    console.log(`Attempting to connect to MongoDB: ${uri}`);
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000 // fail fast if local db is not running
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.log('Attempting fallback to mongodb-memory-server...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const fallbackUri = mongoServer.getUri();
      console.log(`In-memory MongoDB Server started at: ${fallbackUri}`);
      const conn = await mongoose.connect(fallbackUri);
      console.log(`MongoDB Connected (In-Memory Fallback): ${conn.connection.host}`);
    } catch (fallbackError) {
      console.error(`In-Memory Fallback Connection Error: ${fallbackError.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;

