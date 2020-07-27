let mongoose = require('../../database/index');

const schema = new mongoose.Schema({
	nome: {
		type: String,
		required: true
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
				formType: String
			},
			description: {
				formType: String
			}
		}
	]
});

const rest = mongoose.model('restaurantes', schema);
module.exports = rest;
