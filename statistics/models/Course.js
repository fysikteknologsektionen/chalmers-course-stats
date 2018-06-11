const mongoose = require('mongoose');

const Result = mongoose.model('Result').schema;
const schema = new mongoose.Schema({
  courseCode: { type: String, index: true },
  courseName: { type: String, index: true },
  programShort: { type: String, index: true },
  programLong: String,
  results: [Result],
  totalPass: { type: Number, default: 0 },
  totalFail: { type: Number, default: 0 },
  averageGrade: { type: Number, default: 0 },
});

module.exports = mongoose.model('Course', schema);
