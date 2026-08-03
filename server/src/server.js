require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Connect to MongoDB database
  await connectDB();

  // Start Express server listener
  app.listen(PORT, () => {
    console.log(`Server listening in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
};

startServer();
