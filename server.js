const express = require('express');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');

const pgp = require('pg-promise')();

const connectionOptions = {
  host: 'dpg-cj0ma7p8g3n9bruviqf0-a.frankfurt-postgres.render.com',
  port: 5432,
  database: 'torreskere',
  user: 'pablo',
  password: 'hp2kFNElrUL8YbKuNQlfWUp1XUv3qoyN',
  ssl: {
    rejectUnauthorized: false // Configura esta opción según tu certificado SSL/TLS
  }
};

const db = pgp(connectionOptions);
const app = express();
const saltRounds = 10;

app.use(express.json());
app.use(cookieParser('mi secreto'));
app.use(express.static('public'));


app.use('/', express.static('public'));

app.post('/login', function(req, res) {
    db.get('SELECT * FROM users WHERE username = ?', [req.body.username], function(err, row) {
        if (row && bcrypt.compareSync(req.body.password, row.password)) {
            res.cookie('username', row.username, {signed: true});
            if (row.username === 'admin') {
                res.status(200).json({admin: true});
            } else {
                res.status(200).json({admin: false});
            }
        } else {
            res.status(403).send();
        }
    });
});

app.post('/register', function(req, res) {
    let hashedPassword = bcrypt.hashSync(req.body.password, saltRounds);
    db.none('INSERT INTO users (username, password) VALUES (?, ?)', [req.body.username, hashedPassword], function(err) {
        if (err) {
            res.status(500).send();
        } else {
            res.status(200).send();
        }
    });
});

app.get('/logout', function(req, res) {
    res.clearCookie('username');
    res.redirect('/login.html');
});

app.use(function(req, res, next) {
    if (!req.signedCookies.username) {
        res.status(403).send();
    } else {
        next();
    }
});

app.get('/menu', function(req, res) {
    res.send(`
        <h1>Bienvenido, ${req.signedCookies.username}</h1>
        <button onclick="location.href='/logout'">Cerrar sesión</button>
    `);
});

app.listen(3000, function() {
    console.log('Server listening on port 3000');
});
