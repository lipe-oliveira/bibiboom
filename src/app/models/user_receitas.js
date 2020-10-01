let mongoose = require('../../database/index');

const schema = new mongoose.Schema({
	nome: {
		type: String,
		required: true
	},

	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},

	ingredientes: [
		{
			ingrediente: {
				type: String,
				required: true
			},
			quantidade: {
				type: String,
				require: false
			}
		}
	],

	description: {
		type: String,
		required: false
	},

	imagem: {
		type: String
		//required:true
	}
});

const receitas = mongoose.model('receitas', schema);
module.exports = receitas;
