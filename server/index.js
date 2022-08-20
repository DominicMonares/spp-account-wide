const path = require('path');
const express = require('express');
var mysql = require('mysql');
const { con } = require('../db/index.js');

const app = express();

app.use(express.static(path.join(__dirname, '..', '/client/dist')));

app.get('/', (req, res) => {
  res.sendStatus(200);
});

app.get('/cheevo', (req, res) => {
  con.connect(err => {
    if (err) { return res.sendStatus(400).send(err) };
    console.log('Connected to DB!');

    const getCheevos = 'SELECT * FROM character_achievement WHERE guid=4501';
    con.query(getCheevos, (err, data, fields) => {
      if (err) { return res.sendStatus(400).send(err) };
      console.log('DATA ', data);
      return res.send(data);
    });

  });
});

app.listen(3000, () => {
  console.log('Server started on port 3000!');
});
