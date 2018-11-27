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
    var metadata = req.body;
    console.log(req.body);
    var seqFile = req.files.data;
    var localPath = '/tmp/' + Date.now() + '-' + req.files.data.name;
    await seqFile.mv(localPath, function(err) {
      if (err) throw err;
      console.log('File uploaded to '+localPath);
    });
    metadata.date_created = Date.now();
    await Sequence.create(metadata, function(err, sequence) {
      if (err) throw err;
      console.log(sequence);
    });
    await fs.unlink(localPath, function(err) {
      if (err) throw err;
      console.log('File deleted from '+localPath);
    });
    res.json(metadata);
  }
};

exports.dropSeqDB = async function(req, res, next) {
  await Sequence.collection.drop(function(err) {
    if (err) throw err;
    console.log('Dropped sequence database');
  });
  res.end();
};

exports.getSeqList = function(req, res, next) {
  Sequence.find({}).sort({'organism': 1}).limit(10).exec(function(err, seqs) {
    res.json(seqs);
  })
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
