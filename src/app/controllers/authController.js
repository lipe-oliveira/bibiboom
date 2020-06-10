const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const feed = require('../models/user_feeds');
const Image = require('../models/img');
const Restaurante = require('../models/user_restaurantes');
const auth = require('../../config/auth.json');
const bcrypt = require('bcryptjs');
const router = express.Router();

console.log('/authController.js');

function generateToken(params = {}) {
	const token = jwt.sign(params, auth.secret, {
		expiresIn: 86400
	});
	return token;
}

router.put('/update/:id', async (req, res) => {
	try {
		const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });

		return res.send(user);
	} catch (err) {
		console.log(`erro: ${err}`);
		return res.status(400).send({ erro: 'Cannot create new project!' });
	}
});

router.post('/post_get_id', async (req, res) => {
	try {
		const { email } = req.body;
		const { id } = await User.findOne({ email });
		res.send({ id });
	} catch (err) {
		console.log(err);
		res.status(400).send({ error: 'Email not found!' });
	}
});

router.get('/get_feeds', async (req, res) => {
	try {
		res.send(await feed.find().populate('user'));
	} catch (err) {
		console.log(err);
		res.status(400).send({ error: 'Email not found!' });
	}
});

router.get('/get_feeds/:id', async (req, res) => {
	try {
		const feeder = await feed.find().populate(['user', 'email']);
		let vetor = feeder.filter(function (item) {
			console.log(item);
			return item.user.id == req.params.id;
		});

		res.send(vetor);
	} catch (err) {
		console.log(err);
		res.status(400).send({ error: 'Email not found!' });
	}
});

router.get('/get_users', async (req, res) => {
	try {
		const user = await User.find();
		return res.send({ user });
	} catch (err) {}
});

router.post('/register', async (req, res) => {
	const { email } = req.body;

	try {
		if (await User.findOne({ email })) {
			return res.status(400).send({ error: 'E-mail já cadastrado!' });
		}

		const user = await User.create(req.body);
		user.password = undefined;

		return res.send({ user });
		//return res.send({ user, token: generateToken({ id: user.id }) });
	} catch (err) {
		return res.status(400).send({ error: 'Falha de registro!' });
	}
});

router.post('/authenticate', async (req, res) => {
	try {
		console.log('/authenticate');
		const { email, password } = req.body;

		const user = await User.findOne({ email }).select('+password');

		if (!user) {
			return res.status(400).send({ error: 'Usuário não encontrado' });
		}

		if (!(await bcrypt.compare(password, user.password))) {
			return res.status(400).send({ error: 'Senha errada!' });
		}

		user.password = undefined;

		return res.send({ user });
		//return res.send({ user, token: generateToken({ id: user.id }) });
	} catch (err) {
		console.log('erro: ' + err);
		return res.status(400).send({ error: `Falha de autenticação!` });
	}
});

router.post('/feed', async (req, res) => {
	try {
		console.log('/feed');

		await feed.create(req.body);
		const feeder = await feed.find().populate('user');

		return res.send({ feeder });
		//return res.send({ user, token: generateToken({ id: user.id }) });
	} catch (err) {
		console.log('erro: ' + err);
		return res.status(400).send({ error: `Falha de autenticação!` });
	}
});

router.get('/get_restaurantes', async (req, res) => {
	try {
		const resp = await Restaurante.find({});
		res.send(resp);
	} catch (err) {
		res.status(400).send(err);
	}
});

router.post('/post_restaurantes', async (req, res) => {
	try {
		const { id } = req.body;
		if (await Restaurante.findOne({ id })) {
			const { ratings } = req.body;

			let restaurante = await Restaurante.findOne({ id });
			console.log(restaurante);

			let pusher = {
				user: ratings[0],
				rate: ratings[1],
				description: ratings[2]
			};

			await restaurante.ratings.push(pusher);
			await restaurante.save();

			res.send(await Restaurante.findOne({ id }).populate('ratings.user', ['name', 'email']));
		} else {
			res.send(await (await Restaurante.create(req.body)).populate('ratings'));
		}
	} catch (err) {
		res.status(404).send('Já existe esse restaurante!');
		console.log(err);
	}
});

router.post('/post_image', async (req, res) => {
	try {
		const { user } = req.body;
		let img = await Image.findOne({ user });
		console.log(img);

		if (img != null) {
			console.log('Já possui imagem. Substituindo...\n');
			await Image.findOneAndUpdate({ user }, req.body);
		} else {
			console.log('NOT EXISTS!');
			await Image.create(req.body);
		}

		img = await Image.findOne({ user }).populate('user', 'rate', 'description');
		res.send({ img });
	} catch (err) {
		console.log('erro: ' + err);
		return res.status(400).send({ error: `A imagem não pode ser inserida!` });
	}
});

router.post('/get_image', async (req, res) => {
	try {
		const { user } = req.body;

		let imag = await Image.findOne({ user });
		let { imagem } = imag;

		console.log({ imagem });

		res.send({ imagem });
	} catch (err) {
		console.log('erro: ' + err);
		return res.status(400).send({ error: `A imagem não pode ser captada!` });
	}
});

module.exports = (app) => app.use('/users', router);
