const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const AuthError = require('../errors/authError');
const ConflictError = require('../errors/conflictEror');
const NotFoundError = require('../errors/notFoundError');
const RequestError = require('../errors/requestError');
const { secret } = require('../config');
const { singoutMessage, userErrorsMessages } = require('../constants/constants');

const findUser = (id, res, next) => {
  User.findById(id)
    .orFail()
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'DocumentNotFoundError') {
        return next(new NotFoundError(userErrorsMessages.notfound));
      }
      return next(err);
    });
};

const changeUserData = (id, newData, res, next) => {
  User.findByIdAndUpdate(id, newData, { new: true, runValidators: true })
    .orFail()
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'DocumentNotFoundError') {
        return next(new NotFoundError(userErrorsMessages.notfound));
      }
      if (err.code === 11000) {
        return next(new ConflictError(userErrorsMessages.conflict));
      }
      return next(err);
    });
};

module.exports.getCurrentUser = (req, res, next) => findUser(req.user._id, res, next);

module.exports.createUser = (req, res, next) => {
  const {
    email, password, name, about, avatar,
  } = req.body;

  bcrypt.hash(password, 16)
    .then((hash) => {
      User.create({
        email, password: hash, name, about, avatar,
      })
        .then((user) => {
          const noPasswordUser = user.toObject({ useProjection: true });

          return res.status(201).send(noPasswordUser);
        })
        .catch((err) => {
          if (err.name === 'ValidationError') {
            return next(new RequestError(userErrorsMessages.validation));
          }
          if (err.code === 11000) {
            return next(new ConflictError(userErrorsMessages.conflict));
          }
          return next(err);
        });
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        return next(new AuthError(userErrorsMessages.auth));
      }

      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            return next(new AuthError(userErrorsMessages.auth));
          }

          const token = jwt.sign(
            { _id: user._id },
            secret,
            { expiresIn: '7d' },
          );

          res.cookie('jwt', token, {
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            saneSite: true,
          });

          return res.send(user.toJSON({ useProjection: true }));
        });
    })

    .catch(next);
};

module.exports.updateUser = (req, res, next) => {
  const { name, email } = req.body;
  return changeUserData(req.user._id, { name, email }, res, next);
};

module.exports.logout = (req, res) => {
  res.clearCookie('jwt').send({ message: singoutMessage });
};
