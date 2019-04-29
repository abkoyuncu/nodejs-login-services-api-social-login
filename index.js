const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');
const databases = require('./config/db.js');
const cors = require('cors');

const port  = process.env.PORT || 8081;

mongoose.connect(databases.development);
mongoose.Promise = global.Promise;

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


require('./src/routes')(app);


app.listen(port, '0.0.0.0', (err) => {
  if (err) {
    console.log(err);
  }

  console.info(`>>> 🌎abk - login service API is up and running. Open http://0.0.0.0:${port}/ in your browser.`);
});



module.exports = app;
