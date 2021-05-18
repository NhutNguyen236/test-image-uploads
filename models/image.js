var mongoose = require('mongoose');
 
var imageSchema = new mongoose.Schema({
    userid: String,
    img:
    {
        data: Buffer,
        contentType: String
    }
}, {collection: 'profiles'});
 
//Image is a model which has a schema imageSchema
Image = mongoose.model('Image', imageSchema)

module.exports = Image