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

app.post('/login', async function(req, res) {
    try {
      const username = req.body.username;
      const password = req.body.password;
  
      // Verifica que la conexión a la base de datos (db) esté configurada y creada correctamente
  
      // Utiliza una consulta preparada para evitar inyecciones SQL
      const user = await db.oneOrNone('SELECT * FROM public.users WHERE username = $1', [username]);
  
      if (!user) {
        return res.status(403).send(); // Usuario no encontrado
      }

      // Verifica la contraseña utilizando bcrypt
      if (bcrypt.compareSync(password, user.password)) {
        res.cookie('username', user.username, { signed: true });
        if (user.username === 'admin') {
          return res.status(200).json({ admin: true });
        } else {
          return res.status(200).json({ admin: false });
        }
      } else {
        return res.status(403).send(); // Contraseña incorrecta
      }
    } catch (err) {
      console.error('Error al consultar la base de datos:', err);
      return res.status(500).send(); // Error en el servidor
    }
  });


  app.post('/register', async function(req, res) {
    try {
      const username = req.body.username;
      const password = req.body.password;
  
      // Verifica que la conexión a la base de datos (db) esté configurada y creada correctamente
  
      // Verifica si el usuario ya existe en la base de datos
      const existingUser = await db.oneOrNone('SELECT * FROM users WHERE username = $1', [username]);
      if (existingUser) {
        return res.status(409).json({ error: 'El nombre de usuario ya está registrado' });
      }
  
      // Hash de la contraseña utilizando bcrypt
      const hashedPassword = bcrypt.hashSync(password, saltRounds);
  
      // Inserta el nuevo usuario en la base de datos
      await db.none('INSERT INTO users (username, password) VALUES ($1, $2)', [username, hashedPassword]);
  
      return res.status(200).json({ message: 'Usuario registrado exitosamente' });
    } catch (err) {
      console.error('Error al registrar el usuario:', err);
      return res.status(500).json({ error: 'Error al registrar el usuario' });
    }
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
