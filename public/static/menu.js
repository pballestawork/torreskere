import getUsername from './getUsername.js';

let username = getUsername();
document.getElementById('username').textContent = "Bienvenido, " + username;
