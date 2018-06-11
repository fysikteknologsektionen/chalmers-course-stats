const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  date: String,
  resultType: String,
  U: { type: Number, default: 0 },
  3: { type: Number, default: 0 },
  G: { type: Number, default: 0 },
  TG: { type: Number, default: 0 },
  4: { type: Number, default: 0 },
  5: { type: Number, default: 0 },
  VG: { type: Number, default: 0 },
});
module.exports = mongoose.model('Result', schema);
