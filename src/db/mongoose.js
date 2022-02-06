const mongoose = require('mongoose');
require('dotenv').config();
const connection = process.env.CONNECT_MONGOOSE;
mongoose.connect(connection, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
