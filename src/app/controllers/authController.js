const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const feed = require('../models/user_feeds');
const Image = require('../models/img');
const Restaurante = require('../models/user_restaurantes');
const Receita = require('../models/user_receitas');
const auth = require('../../config/auth.json');
const bcrypt = require('bcryptjs');
const { Int32 } = require('mongodb');
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
		console.log(email);
		const { _id } = await User.findOne({ email });
		res.send({ _id });
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


router.post('/post_get_user_salvos', async (req, res) => {
	try {
		const { email } = req.body;
		console.log(email);
		if(await User.findOne({email})){
			return res.send(await User.findOne({ }).populate('salvos.estabelecimento'));
		}
		return res.status(400).send("Não foi possível encontrar nenhum salvo");
	} catch (err) {
		console.log(err);
	}
});


router.get('/get_users', async (req, res) => {
	try {
		return res.send(await User.find({ }).populate('salvos.estabelecimento'));
	} catch (err) {
		console.log(err);
	}
});

router.post('/register', async (req, res) => {
	const { email } = req.body;

	try {
		if (await User.findOne({ email })) {
			return res.status(400).send({ error: 'E-mail já cadastrado!' });
		}

		const user = await User.create(req.body);
		console.log(user);
		user.password = undefined;

		return res.send({ user });
		//return res.send({ user, token: generateToken({ id: user.id }) });
	} catch (err) {
		console.log(err);
		return res.status(400).send({ error: 'Falha de registro!' });
	}
});

router.post('/register_change_restricao', async (req, res) => {
	const { email, tipo } = req.body;

	try {
		if (await User.findOne({ email })) {
			const user = await User.findOne({ email });
	
			user.tipo = tipo;
			user.save();

			console.log(user);
			await User.findOneAndUpdate({email}, user);
	
			return res.send(await User.findOne({ email }));		}

		else{
			return res.send("Usuário não foi encontrado!")
		}

		
		//return res.send({ user, token: generateToken({ id: user.id }) });
	} catch (err) {
		console.log(err);
		return res.status(400).send({ error: 'Falha de registro!' });
	}
});

router.post('/register_salvar', async (req, res) => {
	const { email, id } = req.body;
	const user_main = await User.findOne({email});
	console.log(email + " " + id);

	try {		
		if (await User.findOne({ email })) {
			if(await Restaurante.findOne({id})){
				console.log(email + " a " + id);


				const { _id }  = await Restaurante.findOne({id});
				
				await User.findOne({ email }).then(user => {
					user.salvos.forEach((saved) => {
						console(saved);
						if(saved == id){
							console.log("Esse restaurante está salvo!");
							user_main = "a";
						}
					});						
				});
				

				if(user_main.toString() != "a"){
					estabelecimento = {
						estabelecimento: _id
					};
					console.log(estabelecimento);

					await user_main.salvos.push(estabelecimento);
					await user_main.save();
					
					await User.findOneAndUpdate({email}, user_main);
					const final = await User.findOne({ email }).populate("salvos.estabelecimento");
					console.log(final);

					return res.send(final);
				}
				
			}
		}

		else{
			return res.send("Usuário não encontrado!")
		}

		} catch (err) {
		console.log(err);
		return res.status(400).send({ error: 'Falha de registro!' });
	}
});


router.post('/authenticate', async (req, res) => {
	try {
		console.log('/authenticate');
		const { email, password } = req.body;
		console.log(email);

	
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

router.post('/feed_like', async (req, res) => {
	try {

		const {_id} = req.body;
		let feeder = await feed.findOne({_id});
		feeder.likes = 1 + parseInt(feeder.likes)||0;

		feeder_main = await feed.findOneAndUpdate({_id}, feeder)

		return res.send(feeder_main);
	} catch (err) {
		console.log('erro: ' + err);
		return res.status(400).send({ error: `Falha de autenticação!` });
	}
});


router.get('/get_restaurantes', async (req, res) => {
	try {
		const resp = await Restaurante.find({}).populate('ratings.user').populate('fotos');
		console.log(resp)
		//resp.delete = resp.fotos;
		return await res.send(resp);
	} catch (err) {
		console.log(err);
		return res.status(400).send(err);
	}
});

router.post('/post_restaurantes', async (req, res) => {
	try {
		const { id } = req.body;
		if (await Restaurante.findOne({ id })) {
			const { ratings, descript } = req.body;
			let restaurante = await Restaurante.findOne({ id });


			if(!restaurante.toString().includes(descript)){
				if(descript != undefined){
					let pusher = {
						desc: descript.toString()
					};
					console.log(pusher);

					await restaurante.descript.push(pusher);
					await restaurante.save();
				}
				
			}	
		
			let split = ratings.split(",");
			let pusherr = {
				user: split[0],
				rate: split[1],
				description: split[2]
			};

			console.log(pusherr);

			await restaurante.ratings.push(pusherr);
			await restaurante.save();

			let rest = await Restaurante.findOne({ id });
			rest.fotos = "";
			res.send(rest);
		} else {
			const { ratings, descript} = req.body;

			delete req.body.ratings;
			delete req.body.descript;

			console.log("Corpo2: " + req.body);

			await Restaurante.create(req.body);
			
			// let pusher = {
			// 	desc: descript
			// };

			// await restaurante.descript.push(pusher);
			// await restaurante.save();
			
			let rest = await Restaurante.findOne({ id });
			res.fotos = "";

			res.send(rest);
		}
	} catch (err) {
		res.status(404).send('Já existe esse restaurante!');
		console.log("Corpo3: " + err);
	}
});

router.post('/post_restaurantes_dono', async (req, res) => {
	try {
		const { id, usuario, senha } = req.body;
		if (await Restaurante.findOne({ id })) {
			if(!await Restaurante.findOne({usuario})){
				let restaurante = await Restaurante.findOne({ id });
			
				let pusher = {
					usuario:usuario,
					senha:senha
					
				};
	
				restaurante.dono = pusher;
				restaurante.save();
	
				Restaurante.findOneAndUpdate({id}, restaurante);
	
				let rest = await Restaurante.findOne({ id });
				return res.send(rest);
			}
			return res.status(400).send("Usuário já existente!");
			

		} else {
			return res.status(404).send("Estabelecimento não registrado nos servidores seedy.");
		}
	} catch (err) {
		console.log("Corpo3: " + err);
		res.status(404).send('Já existe esse restaurante!');
	
	}
});

router.post('/post_restaurantes_dono_login', async (req, res) => {
	try {
		const { usuario, senha } = req.body;
	
		await Restaurante.find({}).then(restaurantes => {
			restaurantes.forEach((rest => {
				if("dono" in rest){
					console.log(rest.dono);
					return res.send(rest);
				}
		   }));
	   })
	   .catch(ex => {
		   console.log(ex);
	   });

	} catch (err) {
		console.log("Corpo3: " + err);
		res.status(404).send('Algo deu errado!');
	
	}
});

router.post('/post_restaurantes_get_by_descript', async (req, res) => {
	try {
		const { descript } = req.body;
		restaurantes_map = [];

		await Restaurante.find({}).populate('ratings.user').then(restaurantes => {
			 restaurantes.forEach((rest => {
				 rest.descript.forEach((desc => {
					console.log(desc.desc);
					if(descript == desc.desc){
						console.log("Têm.");
						restaurantes_map.push(rest);
					}
				}));
			}));
		})
		.catch(ex => {
			console.log(ex);
		});

		return res.send(restaurantes_map);
	} catch (err) {
		console.log("Corpo3: " + err);
		res.status(404).send('Algo deu errado!');
	}
});

router.post('/post_restaurantes_register', async (req, res) => {
	try {
		const { usuario, senha } = req.body;
		if (await Restaurante.create(req.body)) {
			const { ratings, descript } = req.body;
			let restaurante = await Restaurante.findOne({ id });

			if(!restaurante.toString().includes(descript)){
				if(descript != undefined){
					let pusher = {
						desc: descript.toString()
					};
					console.log(pusher);

					await restaurante.descript.push(pusher);
					await restaurante.save();
				}
				
			}	
		
			let split = ratings.split(",");
			let pusherr = {
				user: split[0],
				rate: split[1],
				description: split[2]
			};

			console.log(pusherr);

			await restaurante.ratings.push(pusherr);
			await restaurante.save();

			console.log("OIOIOI");
			let rest = await Restaurante.findOne({ id });
			rest.fotos = "";
			res.send(rest);
		} else {
			const { ratings, descript} = req.body;

			delete req.body.ratings;
			delete req.body.descript;

			console.log("Corpo2: " + req.body);

			await Restaurante.create(req.body);
			
			// let pusher = {
			// 	desc: descript
			// };

			// await restaurante.descript.push(pusher);
			// await restaurante.save();
			
			let rest = await Restaurante.findOne({ id });
			res.fotos = "";

			res.send(rest);
		}
	} catch (err) {
		res.status(404).send('Já existe esse restaurante!');
		console.log("Corpo3: " + err);
	}
});

router.post('/post_restaurantes_change_description_by_owner', async (req, res) => {
	try {
		const { id, description} = req.body;
		if (await Restaurante.findOne({ id })) {
			let pusher = {
				description: description
			};

			await Restaurante.findOneAndUpdate({id}, pusher);

			res.send(await Restaurante.findOne({id}));
		} else {
			res.send("Esse restaurante não está registrado no nosso servidor ainda.");
		}
	} catch (err) {
		console.log(err);
		res.status(404).send('Algo deu errado! Aguarde um momento!');
	}
});

router.post('/post_restaurantes_check', async (req, res) => {
	try {
		const { id } = req.body;
		if (await Restaurante.findOne({ id })) {
			console.log(id);

			return res.send('1');
		} else {
			res.send('0');
		}
	} catch (err) {
		res.status(404).send('Error!');
		console.log(err);
	}
});

router.post('/post_restaurantes_img', async (req, res) => {
	try {
		const { id, img } = req.body;
		if (await Restaurante.findOne({ id })) {
			let restaurante = await Restaurante.findOne({ id });

			let pusher = {
				img:img
			};

			await restaurante.fotos.push(pusher);
			await restaurante.save();

			res.send(await Restaurante.findOne({ id }));
		} else {
			res.status(400).send('Restaurante não encontrado!');
		}
	} catch (err) {
		res.status(404).send('Já existe esse restaurante!');
		console.log(err);
	}
});

router.post('/post_restaurantes_img_oficial', async (req, res) => {
	try {
		const { id, img } = req.body;
		if (await Restaurante.findOne({ id })) {
			let restaurante = await Restaurante.findOne({ id });
			
			let pusher = {
				img: img
			};

			await restaurante.fotos.push(pusher);
			await restaurante.fotos.sort({ createdAt: 1 });
			await restaurante.save();

			res.send(await Restaurante.findOne({ id }));
		} else {
			res.status(400).send('Restaurante não encontrado!');
		}
	} catch (err) {
		console.log(err);
		res.status(404).send('Já existe esse restaurante!');
	}
});

router.post('/post_restaurantes_get_img', async (req, res) => {
	try {
		const { id } = req.body;
		if (await Restaurante.findOne({ id })) {
			let restaurante = await Restaurante.findOne({ id });
			let fotos = await restaurante.get('fotos');
			console.log(fotos);

			res.send(fotos);
		} else {
			res.status(400).send('Restaurante não encontrado!');
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

router.post('/post_image_ocult', async (req, res) => {
	try {
		const { user } = req.body;
		let img = await Image_ocult.findOne({ user });

		if (img != null) {
			console.log('Já possui imagem. Substituindo...\n');
			await Image_ocult.create({ user }, req.body);
		} else {
			console.log('NOT EXISTS!');
			await Image.create(req.body);
		}
		res.send("YES");
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

router.post('/post_receita', async (req, res) => {
	try {
		const { nome, user, ingredientes, qtde, description } = req.body;
		
		if (await User.findById(user)) {
			const usuario = User.findOne(user);

			let pusher_ingredientes = [];
			let pusher_qtde = [];

			ingredientes.split(",").forEach(element => {
					pusher_ingredientes.push(element);
			});

			qtde.split(",").forEach(element => {
					pusher_qtde.push(element);
			});

			console.log(pusher_qtde.length);
			let pusher = [];

			for(i = 0; pusher_ingredientes.length;i++){
				pusher.push({
					ingrediente: pusher_ingredientes[i],
					quantidade: pusher_qtde[i]
				}
				);
			}

			console.log(pusher.toString());			
			
			await Receita.create(req.body)
			res.send(await (await Receita.find({})));
		}
		
	} catch (err) {
		res.status(404).send('Já existe esse restaurante!');
		console.log(err);
	}
});

router.get('/get_receita', async (req, res) => {

	try {
		res.send(res.send(await Receita.find({})));
		
		/*
		if (await User.findById(user)) {
			console.log(user);

			const { nome } = req.body;
			
			await Receita.create(req.body)
			res.send(await (await Receita.find({}).populate("user")));
		}
		 else {
			const { ratings } = req.body;

			let pusher = {
				user: ratings[0],
				rate: ratings[1],
				description: ratings[2]
			};

			await delete req.body.ratings;
			await Restaurante.create(req.body);

			let restaurante = await Restaurante.findOne({ id });

			await restaurante.ratings.push(pusher);
			await restaurante.save();

			res.send(await Restaurante.findOne({ id }).populate('ratings.user', ['name', 'email']));
		}
		*/
	} catch (err) {
		res.status(404).send('Já existe esse restaurante!');
		console.log(err);
	}
});

module.exports = (app) => app.use('/users', router);
