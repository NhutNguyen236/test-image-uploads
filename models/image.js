var mongoose = require('mongoose');
 
var imageSchema = new mongoose.Schema({
    name: String,
    desc: String,
    img:
    {
        data: Buffer,
        contentType: String
    }
}, {collection: 'profiles'});
 
//Image is a model which has a schema imageSchema
Image = mongoose.model('Image', imageSchema)

module.exports = Image