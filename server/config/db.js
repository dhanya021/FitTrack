const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (uri && uri.trim() !== '') {
    try {
      const conn = await mongoose.connect(uri);
      console.log(`[FitTrack Database] MongoDB Connected: ${conn.connection.host}`);
      return conn;
    } catch (err) {
      console.error(`[FitTrack Database Error] Connection failed: ${err.message}`);
      if (process.env.NODE_ENV === 'production') {
        process.exit(1);
      }
    }
  } else {
    console.log('[FitTrack Database] Notice: MONGO_URI is not set in server/.env.');
    console.log('[FitTrack Database] To persist records in MongoDB, please configure your MongoDB Atlas connection string in server/.env:');
    console.log('[FitTrack Database] MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/fittrack?retryWrites=true&w=majority');
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
};

module.exports = { connectDB, disconnectDB };
