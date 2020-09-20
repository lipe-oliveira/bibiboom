const mongoose = require('../../database/index');
const bcrypt = require('bcryptjs');

const schema_project = new mongoose.Schema({
	imagem: {
		type: String,
		//timestamps: true,
		setMaxListeners: 100000000000000000000000000000000000000000000000,
		required: true
	},

	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},

	createdAt: {
		type: Date,
		default: Date.now
	}
});

const User = mongoose.model('Img_ocult', schema_project);
module.exports = User;
