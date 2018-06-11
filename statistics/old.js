const mongoose = require('mongoose');
const Result = require('./models/Result');
const Course = require('./models/Course');

mongoose.connect('mongodb://localhost/test');
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  Course.find({ totalPass: 0 }).update({ totalPass: { $sum: ['$results.G'] } }).exec((err2, result2) => {
    console.log(err2);
    console.log(result2);
    process.exit();
  });
});

