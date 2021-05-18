////////////////////////////// Entry point setup///////////////////////
var express = require('express');
var mongoose = require('mongoose')
var fs = require('fs')
var path = require('path')
var session = require('express-session')
var bodyParser = require('body-parser')

var app = express();

app.use(bodyParser.urlencoded({extended: true}))
// Set up port
var port = process.env.port || 8000

// Config DB and schema
var Image = require('./models/image')
var User = require('./models/user')
var db_connection = require('./config/db'); 

// view engine setup
app.set('view engine', 'ejs');

app.use(express.static('views'))
/////////////////////////////////////// EXPRESS-SESSION SETUP ////////////////////////
app.use(session({

	// It holds the secret key for session
	secret: 'Your_Secret_Key',

	// Forces the session to be saved
	// back to the session store
	resave: true, //false

	// Forces a session that is "uninitialized"
	// to be saved to the store
	saveUninitialized: true
}))

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
    res.redirect('/index2')
})

app.get('/login', (req, res) => {
    if(req.session.userid){
        res.redirect('/index2')
    }
    else{
        res.render('login')
    }
})

app.post('/login', (req, res) => {
    var {username} = req.body

    // Check if the user is there or not
    User.find({username: username}, (err, data) => {
        if(err){
          return console.log(err)
        }
        else{
            // If the user is available
            if(data.length != 0){
                req.session.userid = data[0]._id
                req.session.username = data[0].username

                res.redirect('/index2')
            }
            // If user is not available
            else{
                // Create new account for user
                var new_user = new User({username: username})

                new_user.save((err, collection) => {
                    if(err){
                        return res.send(err)
                    }
                    else{
                        req.session.userid = new_user._id
                        req.session.username = new_user.username

                        res.redirect('/index2')
                    }
                })
            }
        }
    })
})

// Show image of the user
app.get('/index2', (req, res) => {
    if(req.session.userid){
        Image.find({userid: req.session.userid}, (err, items) => {
            if (err) {
                console.log(err);
                res.status(500).send('An error occurred', err);
            }
            else {
                res.render('index2', { items: items, username: req.session.username});
            }
        });
    }
    else{
        res.redirect('/login')
    }
})

app.post('/index2', upload.single('image'), (req, res, next) => {
    console.log(req.file)
    var obj = {
        userid: req.session.userid,
        img: {
            data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
            contentType: 'image/png'
        }
    }

    // Look up profile pic in Db with userid
    Image.findOne({userid: req.session.userid}, (err, data) => {
        if(err){
            console.log(err);
            res.status(500).send('An error occurred', err);
        }
        else{
            // If there is a profile matched, update it
            if(data){
                Image.updateOne({userid: req.session.userid}, obj, (err) => {
                    if(err){
                        console.log(err);
                        res.status(500).send('An error occurred', err);
                    }
                    else{
                        res.redirect('/index2')
                    }
                })
            }
            else{
                Image.create(obj, (err, item) => {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        // item.save();
                        res.redirect('/index2');
                    }
                });
            }
        }
    })
})

app.get('/logout', (req, res) => {
 
    req.session.destroy()

    res.redirect('/login')
})


//////////////////////////// SERVER LISTENER ////////////////////////////\
var port = process.env.PORT || 3000
var server = app.listen(process.env.PORT || 3000, () =>{
    console.log("The server is now running at http://localhost:" + port);
})