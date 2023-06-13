const jwt = require('jsonwebtoken');

const AuthError = require('../errors/authError');
const { authErrorMessage } = require('../constants/constants');

const { secret } = require('../config');

module.exports = (req, res, next) => {
  const token = req.cookies.jwt;
  let payload;

  try {
    payload = jwt.verify(token, secret);
  } catch (err) {
    return next(new AuthError(authErrorMessage));
  }

  req.user = payload;

  return next();
};
