////////////////////////////// Entry point setup///////////////////////
var express = require('express');
var mongoose = require('mongoose')
var fs = require('fs')
var path = require('path')
var session = require('express-session')
var bodyParser = require('body-parser')
var multer = require('multer')

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

/////////////////////////////////////// CLOUDINARY CONFIG ////////////////////////////
// I still dont have public_id on Cloudinary for each uploaded image
const cloudinary = require('cloudinary').v2;

// You can find the tut here: https://www.freecodecamp.org/news/how-to-allow-users-to-upload-images-with-node-express-mongoose-and-cloudinary-84cefbdff1d9/
// I dunno why but this link got something wrong in it but basically, the theory in here is quite usable

cloudinary.config({
    cloud_name: "dup5vuryj",
    api_key: "254592227425713",
    api_secret: "5Lo9nzwORU9bg0mvRpxgmEgFibc"
})

const { CloudinaryStorage } = require('multer-storage-cloudinary');

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    // params: {
    //     folder: 'some-folder-name',
    //     format: async (req, file) => 'png', // supports promises as well
    //     public_id: (req, file) => 'computed-filename-using-request',
    // },
    params: {
        folder: "UserPictures",
        allowedFormats: ["jpg", "png"],
        transformation: [{
            width: 500,
            height: 500,
            crop: "limit"
        }]
    }
})
 
// var storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'uploads')
//     },
//     filename: (req, file, cb) => {
//         cb(null, file.fieldname + '-' + Date.now())
//     }
// });
 
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
        imageurl: req.file.path,
        cloudinaryid: req.file.public_id
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