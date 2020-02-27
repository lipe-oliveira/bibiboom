const jwt = require('jsonwebtoken');
const auth = require('../../config/auth.json');

module.exports = (req, res, next) => {
	const authHeader = req.headers.authorization;

	if (!authHeader) {
		return res.status(400).send({ error: 'Token não providenciado!' });
	}

	const parts = authHeader.split(' ');
	console.log(parts);
	if (!parts.length === 2) {
		return res.status(400).send({ error: 'Token erro!' });
	}

	const [scheme, token] = parts;
	if (!/^Bearer$/i.test(scheme)) {
		return res.status(401).send({ erro: 'Token malformatado!' });
	}

	jwt.verify(token, auth.secret, (err, decoded) => {
		if (err) {
			return res.status(401).send({ erro: 'Token errado!' });
		}

		console.log(req.userId, decoded.id);
		req.userId = decoded.id;

		return next();
	});
};
