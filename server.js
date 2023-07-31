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
// Resto del código...

const app = express();
const saltRounds = 10;

app.use(express.json());
app.use(cookieParser('mi secreto'));
app.use(express.static('public'));




bcrypt.hash('soyunbuenadmin', saltRounds, function(err, hash) {
        if (err) {
            console.error(err);
        } else {
            console.log('Contraseña encriptada:', hash);

      db.none(`INSERT INTO Users(username, password) 
              SELECT 'admin', '${hash}' 
              WHERE NOT EXISTS(SELECT 1 FROM Users WHERE username = 'admin')`);
            }
    });
    
    db.none(`CREATE TABLE IF NOT EXISTS Trivial (
          question TEXT PRIMARY KEY,
          answer TEXT,
          type TEXT,
          difficulty TEXT
      )`);

    db.none(`INSERT INTO Trivial(question, answer, type, difficulty) VALUES 
        ('¿Cuál es la capital de España?', 'Madrid', 'Geografía', 'facil'), 
        ('¿Quién escribió "Don Quijote de la Mancha"?', 'Miguel de Cervantes', 'Arte y Literatura', 'facil'),
        ('¿Cuál es el elemento químico de la tabla periódica con el símbolo K?', 'Potasio', 'Ciencia y Naturaleza', 'facil'),
        ('¿Quién es el autor de la teoría de la relatividad?', 'Albert Einstein', 'Historia', 'facil'),
        ('¿En qué ciudad se celebraron los Juegos Olímpicos de verano de 2016?', 'Río de Janeiro', 'Deportes y Pasatiempos', 'facil'),
        ('¿Quién interpretó a Jack Dawson en la película "Titanic"?', 'Leonardo DiCaprio', 'Entretenimiento', 'facil')`);
  

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
