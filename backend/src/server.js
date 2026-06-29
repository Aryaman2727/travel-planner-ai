require('dotenv').config({});
const app = require('./app');
const connectDB = require('./utils/db');
// Debugging log
console.log('MONGODB_URI:', process.env.MONGODB_URI);


const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT} [${process.env.NODE_ENV}]`);
  });
});
