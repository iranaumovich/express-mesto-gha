const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const User = require('../models/user');
const NotFoundError = require('../errors/NotFoundError');
const InvalidUserDataError = require('../errors/InvalidUserDataError');
const InvalidCredentialsError = require('../errors/InvalidCredentialsError');
const ConflictingRequestError = require('../errors/ConflictingRequestError');

function sendUserData(user) {
  return {
    name: user.name,
    about: user.about,
    avatar: user.avatar,
    _id: user._id,
    email: user.email,
  };
}

module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch(next);
};

module.exports.getUserById = (req, res, next) => {
  User.findById(req.params.userId)
    .then((user) => {
      if (user === null) {
        throw new NotFoundError(`Пользователь с id ${req.user._id} не найден`);
      } else {
        res.send(sendUserData(user));
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new InvalidUserDataError('Переданы некорректные данные пользователя');
      }
    })
    .catch(next);
};

module.exports.getCurrentUser = (req, res, next) => {
  User.findOne(req.user)
    .then((user) => res.send(sendUserData(user)))
    .catch(next);
};

module.exports.createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;

  if (!validator.isEmail(email)) {
    next(new InvalidUserDataError('Переданы некорректные данные при создании пользователя'));
  }

  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name, about, avatar, email, password: hash,
    }))
    .then((user) => res.send(sendUserData(user)))
    .catch((err) => {
      if (err.code === 11000) {
        throw new ConflictingRequestError('Пользователь с таким email уже зарегистрирован');
      }

      if (err.name === 'ValidationError') {
        throw new InvalidUserDataError('Переданы некорректные данные при создании пользователя');
      }
    })
    .catch(next);
};

module.exports.updateUser = (req, res, next) => {
  const { name, about } = req.body;

  User.findByIdAndUpdate(
    req.user._id,
    { name, about },
    {
      new: true,
      runValidators: true,
    },
  )
    .then((user) => {
      if (user === null) {
        throw new NotFoundError(`Пользователь с id ${req.user._id} не найден`);
      } else {
        res.send(sendUserData(user));
      }
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new InvalidUserDataError('Переданы некорректные данные при обновлении профиля');
      }
    })
    .catch(next);
};

module.exports.updateUserAvatar = (req, res, next) => {
  const { avatar } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { avatar },
    {
      new: true,
      runValidators: true,
    },
  )
    .then((user) => {
      if (user === null) {
        throw new NotFoundError(`Пользователь с id ${req.user._id} не найден`);
      } else {
        res.send(sendUserData(user));
      }
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new InvalidUserDataError('Переданы некорректные данные при обновлении аватара');
      }
    })
    .catch(next);
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        return Promise.reject(new InvalidCredentialsError('Введен некорректный email'));
      }

      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
          // хеши не совпали — отклоняем промис
            return Promise.reject(new InvalidCredentialsError('Неправильные почта или пароль'));
          }
          // аутентификация успешна, возвращаем токен, защищенный куки
          const token = jwt.sign(
            { _id: user._id },
            'token-secret-key',
            { expiresIn: '7d' },
          );

          res
            .cookie('jwt', token, {
              maxAge: 3600000 * 24 * 7,
              httpOnly: true,
            }).send('Authorized');
        });
    })
    .catch(next);
};
