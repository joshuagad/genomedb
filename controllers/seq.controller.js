var request = require('request');
var fs = require('fs');
var fasta = require('bionode-fasta');
var mongoose = require('mongoose');
mongoose.connect('mongodb://mongo/genomedb', {useNewUrlParser: true});

var Sequence = require('../models/sequence.model.js');

exports.uploadNewSeq = async function(req, res, next) {
  if (req.busboy == null) res.sendStatus(400);
  else {
    var metadata = await new Promise(resolve => {
      metadata = {};
      req.busboy.on('file', function(fieldname, file, filename, enconding, mimetype) {
        // console.log(file);
        file.pipe(fs.createWriteStream('/tmp/'+Date.now()+'-'+filename));
      });
      req.busboy.on('field', function(key, value, keyTruncated, valueTruncated) {
        metadata[key] = value;
      });
      req.busboy.on('finish', function() {
        resolve(metadata);
      });
      req.pipe(req.busboy);
    });
    metadata["date_created"] = Date.now();
    var entry = await new Promise(resolve => {
      Sequence.create(metadata, function(err, sequence) {
        if (err) throw err;
        resolve(sequence);
      });
    });
    console.log(entry);
    // await request.post({
    //   url: 'http://10.227.203.93:4000/api/v1/sequence',
    //   formData: {
    //     sequence: fs.createReadStream(localPath),
    //     metadata: JSON.stringify(entry)
    //   }
    // }, function(err) {
    //   if (err) throw err;
    //   console.log('File uploaded to 10.227.203.93');
    // });
    res.end();
  }
  // if (req.files == null) res.sendStatus(400);
  // else {
  //   var metadata = req.body;
  //   var seqFile = req.files.sequence;
  //   var localPath = '/tmp/' + Date.now() + '-' + req.files.sequence.name;
  //   await seqFile.mv(localPath, function(err) {
  //     if (err) throw err;
  //     console.log('File uploaded to '+localPath);
  //   });
  //   metadata.date_created = Date.now();
  //   var entry = await new Promise(resolve => {
  //     Sequence.create(metadata, function(err, sequence) {
  //       if (err) throw err;
  //       resolve(sequence);
  //     });
  //   });
  //   entry.data = fs.createReadStream(localPath);
  //   await request.post({
  //     url: 'http://10.227.203.93:4000/api/v1/sequence',
  //     formData: {
  //       sequence: fs.createReadStream(localPath),
  //       metadata: JSON.stringify(entry)
  //     }
  //   }, function(err) {
  //     if (err) throw err;
  //     console.log('File uploaded to 10.227.203.93');
  //   });
  //   await fs.unlink(localPath, function(err) {
  //     if (err) throw err;
  //     console.log('File deleted from '+localPath);
  //   });
  //   res.json(metadata);
  // }
};

exports.dropSeqDB = async function(req, res, next) {
  await Sequence.collection.drop(function(err) {
    if (err) throw err;
    console.log('Dropped sequence database');
  });
  res.end();
};

exports.getSeqList = function(req, res, next) {
  Sequence.find({}).sort({'organism': 1}).limit(30).exec(function(err, seqs) {
    res.json(seqs);
  })
};

exports.getSeqMetadataByID = function(req, res, next) {
  Sequence.findById(req.params.id, function(err, sequence) {
    if (err) throw err;
    res.json(sequence);
  });
};

exports.getSeqFastaByID = function(req, res, next) {
  res.redirect("https://mbb.pregi.net/local/v1/sequence/"+req.params.id+"/fasta");
};

exports.deleteSeqByID = function(req, res, next) {
  Sequence.deleteOne({ _id: req.params.id }, function(err, sequence) {
    if (err) throw err;
    res.json(sequence);
  });
};
