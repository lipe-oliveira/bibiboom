const mongoose = require('../../database/index');
const bcrypt = require('bcryptjs');

const schema = new mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	email: {
		type: String,
		unique: true,
		required: true,
		lowercase: true
	},
	password: {
		type: String,
		required: true,
		select: false
	},
	img: {
		type: Buffer,
		required: false
	},
	tipo: {
		type: String,
		required: true
	},
	salvos:[{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'restaurantes',
		required: false
	}
	],
	createdAt: {
		type: Date,
		default: Date.now
	}
});

schema.pre('save', async function (next) {
	const hash = await bcrypt.hash(this.password, 10);
	this.password = hash;

	next();
});

const User = mongoose.model('User', schema);
module.exports = User;
