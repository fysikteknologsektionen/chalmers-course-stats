const express = require('express');
const path = require('path');
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

app.use(express.static(path.join(__dirname, 'build')));

app.use('/', router);

app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(port, () => {
  console.log('Ready to go');
});

