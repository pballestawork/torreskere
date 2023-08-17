import getUsername from './getUsername.js';

//codigos mensajes
const broadcastOp = '000';
const readyOp = '001';
const notReadyOp = '101';
const countdownOp = '002';

let username = getUsername();
let isReady = false;

// Conexion inicial
const ws = new WebSocket(`ws://localhost:3000?username=${encodeURIComponent(username)}`);

//Como el root
const usersDiv = document.getElementById('container');

// Funciones
ws.onmessage = function(event) {
    const message = event.data;
    const operationCode = message.substring(0, 3);
    const htmlCode = message.substring(3);

    if (operationCode != countdownOp) {
        usersDiv.innerHTML = htmlCode;
    }else{
        setTimeout(function() {
            window.location.href = '/menu.html';
        }, 1000);
    }
};

function toggleReady() {
    if (!isReady) {
        ws.send(readyOp);
        document.getElementById('readyButton').textContent = 'No listo';
    } else {
        ws.send(notReadyOp);
        document.getElementById('readyButton').textContent = 'Listo';
    }
    isReady = !isReady;
}

document.getElementById('readyButton').addEventListener('click', toggleReady);