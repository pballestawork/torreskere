const bcrypt = require('bcrypt');
const pgp = require('pg-promise')();
   
const db = pgp('postgres://pablo:hp2kFNElrUL8YbKuNQlfWUp1XUv3qoyN@dpg-cj0ma7p8g3n9bruviqf0-a.frankfurt-postgres.render.com/torreskere');

async function initDB() {
  try {
    // Inserción del usuario 'admin' en la tabla 'users'
    const hashedPassword = await bcrypt.hash('soyunbuenadmin', 10);
    console.log(hashedPassword)
    await db.none('INSERT INTO users (username, password, role) VALUES ($1, $2, $3)', ['admin', hashedPassword, 'admin']);

    // Inserción de las preguntas en la tabla 'trivial'
    const preguntas = [
      {
        question: '¿En qué año se descubrió América?',
        answer: '1492',
        type: 'historia',
        difficulty: 'facil'
      }
    ];

    await db.tx(async (t) => {
      for (const pregunta of preguntas) {
        await t.none('INSERT INTO trivial (question, answer, type, difficulty) VALUES ($1, $2, $3, $4)', [
          pregunta.question,
          pregunta.answer,
          pregunta.type,
          pregunta.difficulty
        ]);
      }
    });

    console.log('Base de datos inicializada correctamente.');
  } catch (err) {
    console.error('Error al inicializar la base de datos:', err);
  } finally {
    pgp.end();
  }
}

initDB();
