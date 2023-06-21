const Card = require('../models/card');
const NotFoundError = require('../errors/NotFoundError');
const InvalidUserDataError = require('../errors/InvalidUserDataError');
const ForbiddenError = require('../errors/ForbiddenError');

module.exports.getCards = (req, res, next) => {
  Card.find({})
    .populate('owner')
    .then((cards) => res.send({ data: cards }))
    .catch(next);
};

module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;
  const id = req.user._id;

  Card.create({ name, link, owner: id })
    .then((card) => card.populate('owner'))
    .then((card) => res.send(card))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new InvalidUserDataError('Переданы некорректные данные для создания карточки');
      }

      throw err;
    })
    .catch(next);
};

module.exports.deleteCard = (req, res, next) => {
  Card.findByIdAndRemove(req.params.cardId)
    .then((card) => {
      if (card === null) {
        throw new NotFoundError(`Карточка с id ${req.params.cardId} не найдена`);
      }
      if (!card.owner.equals(req.user._id)) {
        throw new ForbiddenError('Нет прав для удаления карточки');
      }

      res.send(card);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new InvalidUserDataError('Переданы некорректные данные для удаления карточки');
      }

      throw err;
    })
    .catch(next);
};

module.exports.likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (card === null) {
        throw new NotFoundError(`Карточка с id ${req.params.cardId} не найдена`);
      } else {
        res.send(card);
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new InvalidUserDataError('Переданы некорректные данные для постановки лайка');
      }

      throw err;
    })
    .catch(next);
};

module.exports.dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (card === null) {
        throw new NotFoundError(`Карточка с id ${req.params.cardId} не найдена`);
      } else {
        res.send(card);
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new InvalidUserDataError('Переданы некорректные данные для снятия лайка');
      }

      throw err;
    })
    .catch(next);
};
