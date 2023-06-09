const User = require('../models/user');
const {
  ERROR_CODE_400, ERROR_CODE_404, ERROR_CODE_500,
} = require('../constants');

function sendUserData(user) {
  return {
    name: user.name,
    about: user.about,
    avatar: user.avatar,
    _id: user._id,
  };
}

module.exports.getUsers = (req, res) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch(() => res.status(ERROR_CODE_500).send({ message: 'Ошибка сервера' }));
};

module.exports.getUserById = (req, res) => {
  User.findById(req.params.userId)
    .then((user) => {
      if (user === null) {
        res.status(ERROR_CODE_404).send({ message: `Пользователь с id ${req.user._id} не найден` });
      } else {
        res.send(sendUserData(user));
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(ERROR_CODE_400).send({ message: 'Переданы некорректные данные пользователя' });
      } else {
        res.status(ERROR_CODE_500).send({ message: 'Ошибка сервера' });
      }
    });
};

module.exports.createUser = (req, res) => {
  const { name, about, avatar } = req.body;

  User.create({ name, about, avatar })
    .then((user) => res.send(sendUserData(user)))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(ERROR_CODE_400).send({ message: 'Переданы некорректные данные при создании пользователя' });
      } else {
        res.status(ERROR_CODE_500).send({ message: 'Ошибка сервера' });
      }
    });
};

module.exports.updateUser = (req, res) => {
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
        res.status(ERROR_CODE_404).send({ message: `Пользователь с id ${req.user._id} не найден` });
      } else {
        res.send(sendUserData(user));
      }
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(ERROR_CODE_400).send({ message: 'Переданы некорректные данные при обновлении профиля' });
      } else {
        res.status(ERROR_CODE_500).send({ message: 'Ошибка сервера' });
      }
    });
};

module.exports.updateUserAvatar = (req, res) => {
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
        res.status(ERROR_CODE_404).send({ message: `Пользователь с id ${req.user._id} не найден` });
      } else {
        res.send(sendUserData(user));
      }
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(ERROR_CODE_400).send({ message: 'Переданы некорректные данные при обновлении аватара' });
      } else {
        res.status(ERROR_CODE_500).send({ message: 'Ошибка сервера' });
      }
    });
};
