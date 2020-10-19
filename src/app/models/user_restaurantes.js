let mongoose = require('../../database/index');

const schema = new mongoose.Schema({
	nome: {
		type: String,
		required: false
	},
	dono: {
		usuario:{
			type: String,
			required: false
		},
		senha: {
			type: String,
			required: false
		},
	},
	description: {
		type: String,
		required: false
	},
	latlng: {
		type: String,
		required: false
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
		required: false
	},
	fotos: [
		{
			img: {
				type: String,
				setMaxListeners: 100000000000000000000000000000000000000000000000,

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
