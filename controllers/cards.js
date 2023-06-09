const Card = require('../models/card');
const {
  ERROR_CODE_400, ERROR_CODE_404, ERROR_CODE_500,
} = require('../constants');

module.exports.getCards = (req, res) => {
  Card.find({})
    .populate('owner')
    .then((cards) => res.send({ data: cards }))
    .catch(() => res.status(ERROR_CODE_500).send({ message: 'Ошибка сервера' }));
};

module.exports.createCard = (req, res) => {
  const { name, link } = req.body;
  const id = req.user._id;

  Card.create({ name, link, owner: id })
    .then((card) => card.populate('owner'))
    .then((card) => res.send(card))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(ERROR_CODE_400).send({ message: 'Переданы некорректные данные для создания карточки' });
      } else {
        res.status(ERROR_CODE_500).send({ message: 'Ошибка сервера' });
      }
    });
};

module.exports.deleteCard = (req, res) => {
  Card.findByIdAndRemove(req.params.cardId)
    .then((card) => {
      if (card === null) {
        res.status(ERROR_CODE_404).send({ message: `Карточка с id ${req.params.cardId} не найдена` });
      } else {
        res.send(card);
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(ERROR_CODE_400).send({ message: 'Переданы некорректные данные для постановки лайка' });
      } else {
        res.status(ERROR_CODE_500).send({ message: 'Ошибка сервера' });
      }
    });
};

module.exports.likeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (card === null) {
        res.status(ERROR_CODE_404).send({ message: `Карточка с id ${req.params.cardId} не найдена` });
      } else {
        res.send(card);
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(ERROR_CODE_400).send({ message: 'Переданы некорректные данные для постановки лайка' });
      } else {
        res.status(ERROR_CODE_500).send({ message: 'Ошибка сервера' });
      }
    });
};

module.exports.dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (card === null) {
        res.status(ERROR_CODE_404).send({ message: `Карточка с id ${req.params.cardId} не найдена` });
      } else {
        res.send(card);
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(ERROR_CODE_400).send({ message: 'Переданы некорректные данные для снятия лайка' });
      } else {
        res.status(ERROR_CODE_500).send({ message: 'Ошибка сервера' });
      }
    });
};
