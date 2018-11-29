var mongoose = require('mongoose');

var SequenceSchema = new mongoose.Schema({
  sequence_desc: String,
  organism: String,
  remote_ips: [String],
  date_created: Date,
  num_downloads: Number
});

module.exports = mongoose.model('Sequence', SequenceSchema);
