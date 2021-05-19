var mongoose = require('mongoose');
 
var imageSchema = new mongoose.Schema({
    userid: String,
    imageurl: String,
    cloudinaryid: String
}, {collection: 'profiles'});
 
//Image is a model which has a schema imageSchema
Image = mongoose.model('Image', imageSchema)

module.exports = Image