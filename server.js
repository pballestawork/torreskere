const express = require('express');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const pgp = require('pg-promise')();

//credenciales para la bd
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

/*
El middleware actua de manera secuencial. 
1 - Si recibe petición basica (login) es permitida
2 - Si tiene usuario puede acceder a todos menos (admin)
3 - Si eres admin puedes acceder a todo
*/
app.use(express.json());
app.use(cookieParser('mi secreto'));

// Middleware para permitir el acceso a recursos básicos
// Si tienes username pasas al siguiente acceso
app.use((req, res, next) => {
  const allowedPaths = ['/login.html', '/', '/css/login.css', '/static/login.js'];
  if (allowedPaths.includes(req.path) || (req.path === '/login' && req.method === 'POST')) {
      next();
  } else if (!req.signedCookies.usernameCookie) {
      res.status(403).send('No autorizado');
  } else {
      next();
  }
});

// Middleware para restringir el acceso a /admin.html
app.use(['/admin.html','/register'], (req, res, next) => {
  console.log('middleware 2');
  if (req.signedCookies.adminCookie !== 'true') {
      res.status(403).send('Acceso restringido solo para administradores');
  } else {
      next();
  }
});

app.use(express.static('public'));//En este punto cualquier cliente tiene acceso a todos los recursos

app.post('/login', async function(req, res) {
  try {
    const username = req.body.username;
    const password = req.body.password;

    // Utiliza una consulta preparada para evitar inyecciones SQL.
    // Se podrían realizar inyecciones SQL? SI. Habría que procesar la petición
    const user = await db.oneOrNone('SELECT * FROM public.users WHERE username = $1', [username]);

    if (!user) {
      return res.status(403).send(); // Usuario no encontrado
    }

    // Verifica la contraseña utilizando bcrypt
  if (bcrypt.compareSync(password, user.password)) {
    //httpOnly true -> que no se pueden acceder a cookies mediante javascript. Lo desactivamos de momento.
      res.cookie('usernameCookie', user.username, { httpOnly:false,signed: true});
      res.cookie('adminCookie', user.username === 'admin', { httpOnly:false,signed: true});
      return res.status(200).send('Inicio de sesión exitoso');
  } else {
      return res.status(403).send('Contraseña incorrecta');
  }
  } catch (err) {
    console.error('Error al consultar la base de datos:', err);
    return res.status(500).send(); // Error en el servidor
  }
});

// Endpoint para verificar si el usuario es admin.
app.get('/check-if-admin', (req, res) => {
  // Verifica si la cookie 'admin' existe y es 'true'
  if (req.signedCookies && req.signedCookies.adminCookie && req.signedCookies.adminCookie === 'true') {
      res.json({ isAdmin: true });
  } else {
      res.json({ isAdmin: false });
  }
});

//Borra las cookies
app.get('/logout', function(req, res) {
    res.clearCookie('usernameCookie');
    res.clearCookie('adminCookie');
    res.redirect('/login.html');
});

//Registra un usuario que no exista ya. Se necesita ser admin para esto.
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

app.listen(3000, function() {
    console.log('Server listening on port 3000');
});
