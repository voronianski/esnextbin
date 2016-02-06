var express = require('express');
var port = 9292;
var app = express();
app.use(express.static(__dirname));
app.listen(port);
console.log('dev server started on localhost:%s', port);
