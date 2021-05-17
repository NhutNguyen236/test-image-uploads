const mongoose = require('mongoose')

//var url = 'mongodb://localhost:27017/Profile'
var url = 'mongodb+srv://Phong:pjOAkDdSoSiXZ3x2@cluster0.ndps2.mongodb.net/Test?retryWrites=true&w=majority'
var db = mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}, (err) => {
  if (!err) {
    console.log('MongoDB Connection Succeeded.');
  } else {
    console.log('Error in DB connection : ' + err);
  }
});

var db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
});