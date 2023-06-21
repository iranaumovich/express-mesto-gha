const jwt = require('jsonwebtoken');
const InvalidCredentialsError = require('../errors/InvalidCredentialsError');

module.exports = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw new InvalidCredentialsError('Необходима авторизация');
  }

  const token = authorization.replace('Bearer ', '');
  let payload;
  try {
    payload = jwt.verify(token, 'token-secret-key');
  } catch (err) {
    throw new InvalidCredentialsError('Необходима авторизация');
  }

  req.user = payload;

  next();
};
