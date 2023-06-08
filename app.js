const express = require('express');
const mongoose = require('mongoose');

// настроили порт из переменной окружения, который слушаем.
const { PORT = 3000 } = process.env;

const app = express();

// подключаемся к серверу mongo
mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
});

app.use(express.json());

app.use((req, res, next) => {
  req.user = {
    _id: '64805d4b3a7545086d6de376',
  };

  next();
});

app.use('/', require('./routes/users'));
app.use('/', require('./routes/cards'));

app.use((req, res, next) => {
  res.status(404).send({ message: 'Путь не найден' });next();
});

app.listen(PORT);
