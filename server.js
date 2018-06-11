const express = require('express');
const mongoose = require('mongoose');
require('./statistics/models/Result');
require('./statistics/models/Course');
const router = require('./statistics/routes/routes');

const app = express();
const port = 3001;
const dbURI = 'mongodb://localhost/test';
mongoose.connect(dbURI);
mongoose.connection.on('connected', () => {
  console.log('Mongoose on');
});


app.use('/', router);
app.listen(port, () => {
  console.log('Ready to go');
});

