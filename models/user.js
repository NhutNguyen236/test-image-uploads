  
var mongoose = require('mongoose')
var Schema = mongoose.Schema

userSchema = new Schema( {
	username: String
}, {collection: 'users'}),

// model is very important, point to the right database(model) name to get access correctly
User = mongoose.model('User', userSchema)

// So we are now in Users.user
module.exports = User