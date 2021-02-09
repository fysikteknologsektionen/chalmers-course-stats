require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);
mongoose.set('useNewUrlParser', true);
require('./statistics/models/Result');
require('./statistics/models/Course');
const router = require('./statistics/routes/routes');

const app = express();
const dbURI = `mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`;
mongoose.connect(dbURI, {
  user: process.env.DB_USER,
  pass: process.env.DB_PASSWORD,
  useNewUrlParser: true,
  useUnifiedTopology: true
});
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to database...');
});

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(express.static(path.join(__dirname, 'build')));

app.use('/', router);

app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(process.env.APP_PORT, () => {
  console.log(`Express listening on ${process.env.APP_PORT}...`);
});
