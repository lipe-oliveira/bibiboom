let mongoose = require('../../database/index');

const schema = new mongoose.Schema({
	nome: {
		type: String,
		required: true
	},
	description: {
		type: String,
		required: false
	},
	latlng: {
		type: String,
		required: true
	},
	descript: [
		{
			desc: {
				type: String,
				required: false

			}
		}
	],
	id: {
		type: String,
		required: true
	},
	fotos: [
		{
			img: {
				type: String
			},

			createdAt: {
				type: Date,
				default: Date.now
			}
		}
	],
	ratings: [
		{
			user: {
				type: mongoose.Schema.Types.ObjectId,
				ref: 'User',
				required: false
			},
			rate: {
				type: String,
				required: false

			},
			description: {
				type: String,
				required: false

			}
		}
	]
});

const rest = mongoose.model('restaurantes', schema);
module.exports = rest;
