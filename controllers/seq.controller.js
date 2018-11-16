var fs = require('fs');
var fasta = require('bionode-fasta');
var mongoose = require('mongoose');
mongoose.connect('mongodb://mongo/genomedb', {useNewUrlParser: true});

var Sequence = require('../models/sequence.model.js');

exports.test = function(req, res, next) {
  Sequence.find({}, function(err, result) {
    if (err) throw err;
    console.log(result);
    res.json(result);
  });
};

exports.uploadNewSeq = async function(req, res, next) {
  if (req.files == null) res.sendStatus(400);
  else {
    var seqFile = req.files.data;
    var localPath = '/tmp/' + Date.now() + '-' + req.files.data.name;
    await seqFile.mv(localPath, function(err) {
      if (err) throw err;
      console.log('File uploaded to '+localPath);
    });
    await Sequence.create({date_created: Date.now()}, function(err, sequence) {
      if (err) throw err;
      console.log(sequence);
    });
    await fs.unlink(localPath, function(err) {
      if (err) throw err;
      console.log('File deleted from '+localPath);
    });
    //fasta.obj(localPath).on('data', console.log);
    res.end();
  }
};

exports.getSeqMetadataByID = function(req, res, next) {
  Sequence.findById(req.params.id, function(err, sequence) {
    if (err) throw err;
    res.json(sequence);
  });
};

exports.deleteSeqByID = function(req, res, next) {
  Sequence.deleteOne({ _id: req.params.id }, function(err, sequence) {
    if (err) throw err;
    res.json(sequence);
  });
};
