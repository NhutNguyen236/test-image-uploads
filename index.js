////////////////////////////// Entry point setup///////////////////////
var express = require('express');
var mongoose = require('mongoose')
var bodyParser = require('body-parser')
var fs = require('fs')
var path = require('path')
 
var app = express();

app.use(bodyParser.urlencoded({extended: true}))
// Set up port
var port = process.env.port || 8000

// Config DB and schema
var Image = require('./models/image')
var db_connection = require('./config/db'); 

// view engine setup
app.set('view engine', 'ejs');

app.use(express.static('views'))
/////////////////////////////////////// FILE STORAGE CONFIG //////////////////////////
var multer = require('multer');
 
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now())
    }
});
 
var upload = multer({ storage: storage });

/////////////////////////////////////// ROUTES //////////////////////////////////////
app.get('/', (req, res) => {
    res.redirect('/index')
})

app.get('/index', (req, res) => {
    Image.find({}, (err, items) => {
        if (err) {
            console.log(err);
            res.status(500).send('An error occurred', err);
        }
        else {
            console.log(items)
            res.render('index', { items: items });
        }
    });
})

app.post('/index', upload.single('image'), (req, res, next) => {
 
    var obj = {
        name: req.body.name,
        desc: req.body.desc,
        img: {
            data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
            contentType: 'image/png'
        }
    }
    Image.create(obj, (err, item) => {
        if (err) {
            console.log(err);
        }
        else {
            // item.save();
            res.redirect('/index');
        }
    });
})

//////////////////////////// SERVER LISTENER ////////////////////////////\
var server = app.listen(process.env.PORT || 3000, () =>{
    //console.log("The server is now running at http://localhost:" + PORT);
})