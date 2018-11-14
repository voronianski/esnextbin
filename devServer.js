const path = require('path');
const express = require('express');

const port = process.env.PORT || 9292;
const app = express();

app.use(express.static(path.join(__dirname, './public')));
app.listen(port);

console.log('dev server started on http://localhost:%s', port);
