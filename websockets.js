const WebSocket = require('ws');
const url = require('url');


//codigos mensajes
const broadcastOp = '000';
const readyOp = '001';
const notReadyOp = '101';
const countdownOp = '002';



//Variables globales
let countdown = 5;

// Objeto para almacenar las asociaciones entre conexiones y nombres de usuario
const connections = new Map();
let readyCount = 0;

const setupWebSockets = (server) => {
    const wss = new WebSocket.Server({ server });

    wss.on('connection', (ws, request) => {
        const parsedUrl = url.parse(request.url, true); // Analiza la URL y obtén el objeto de parámetros
        const username = decodeURIComponent(parsedUrl.query.username); // Extrae el username del query string

        connections.set(ws, [username,false]); // Asocia la conexión con el nombre de usuario y datos extras

        wss.broadcast(wss.allUsers());
        ws.on('message', (message) =>{
            const messageString = message.toString('utf8')
            const cliente = connections.get(ws); // Obtiene el nombre de usuario asociado con la conexión

            if (messageString === readyMsg) {
                console.log(`Mensaje Ready de ${cliente}`);
                if(!cliente[1]){

                    readyCount++;
                    cliente[1]=!cliente[1];

                    connections.set(ws,cliente);
                    wss.broadcast(`Usuarios listos: ${readyCount}/${connections.size}\n`);
                    wss.cuentaAtras();//Realiza la cuenta atrás
                }
            }else if(messageString === notReadyMsg){
                console.log(`Mensaje notReady de ${cliente}`);
                if(cliente[1]){
                    readyCount--;
                    cliente[1]=!cliente[1];
                    connections.set(ws,cliente);
                    wss.broadcast(`Usuarios listos: ${readyCount}/${connections.size}\n`);
                }
            }
            
        }); 

        //Cierra la conexión y lo elimina del mapa
        ws.on('close', function() {
            const client = connections.get(ws)
            if(client[1])
                readyCount = Math.max(0, readyCount - 1); // reduce ready count but don't let it go below zero
            connections.delete(ws); // Elimina la asociación de la conexión al cerrarse

            console.log(`Conexión cerrada para ${username}`);
            wss.broadcast(`Usuarios listos: ${readyCount}/${connections.size}\n`);
            wss.cuentaAtras();//Realiza la cuenta atrás
        });

        // Mensaje de cuantos jugadores hay listos
    });

    // Método para enviar mensajes a todos los clientes conectados
    wss.broadcast = function broadcast(msg) {
        wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(msg);
            }
        });
    };

    wss.cuentaAtras = function cuentaAtras(){
        countdown = 5;
        if (readyCount === connections.size) {
            const interval = setInterval(() => {
                if (readyCount !== connections.size) {
                    clearInterval(interval); // Cancelar el intervalo si un jugador deja de estar listo.
                    wss.broadcast(`Usuarios listos: ${readyCount}/${connections.size}\n`);
                    return; 
                }
                wss.broadcast(`Comenzando en: ${countdown}`);
                countdown--;
                if (countdown < 0) {
                    clearInterval(interval);
                    wss.broadcast(countdownMsg);
                }
            }, 1000);
        } 
    }

    wss.allUsers = function allUsers(){
        let message = broadcastOp;
        connections.forEach(element => {
            if(element[1]){
                message = message + `<div class="box">${element[0]} Listo </div>`; 
            }else{
                message = message + `<div class="box">${element[0]}</div>`; 
            }
        });
        return message;
    }
}

module.exports = setupWebSockets;