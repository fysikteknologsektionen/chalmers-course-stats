const mongoose = require('mongoose');

const Result = mongoose.model('Result').schema;
const schema = new mongoose.Schema({
  courseCode: { type: String, index: true },
  courseName: { type: String, index: true },
  programShort: { type: String, index: true },
  programLong: String,
  results: [Result],
  totalPass: { type: Number, default: 0 },
  averageGrade: { type: Number, default: 0 },
  U: { type: Number, default: 0 },
  G: { type: Number, default: 0 },
  TG: { type: Number, default: 0 },
  3: { type: Number, default: 0 },
  4: { type: Number, default: 0 },
  5: { type: Number, default: 0 },
});

module.exports = mongoose.model('Course', schema);
