const mongoose = require('../../database/index');
const bcrypt = require('bcryptjs');
const { Double } = require('mongodb');

const schema_project = new mongoose.Schema({
	text: {
		type: String,
		required: true
	},
	
	likes: {
		type:String
	},

	hashtags: [{

	}],
	
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},
	
	img: {
		type: String,
		required: false
	},

	createdAt: {
		type: Date,
		default: Date.now
	}
});

const User = mongoose.model('Feed', schema_project);
module.exports = User;
