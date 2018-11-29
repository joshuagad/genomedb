var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var busboy = require('connect-busboy');

var apiRouter = require('./routes/api');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(busboy({
  highWaterMark: 2*1024*1024
}));

app.use('/api', apiRouter);

module.exports = app;
