const http = require('http');
// import et connexion MQTT
const mqtt = require('mqtt');
const mqttClient = mqtt.connect('mqtt://captain.dev0.pandor.cloud:1884');
// connexion WebSocket
const WebSocket = require('ws');

const PORT = 8080;

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Node server is on !\n');
});

mqttClient.on('connect', () => {
    console.log('Connecté au broker MQTT');
    // mqttClient.subscribe('classroom/+/telemetry', (err) => {
    //     if (err) {
    //         console.error('Erreur abonnement MQTT :', err);
    //     } else {
    //         console.log('Abonné à classroom/+/telemetry');
    //     }
    // });
});

// Réception des messages MQTT
mqttClient.on('message', (topic, message) => {
    console.log(`MQTT [${topic}] : ${message.toString()}`);

    // On envoie les messages reçus aux clients WebSocket connectés
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
                topic,
                message: message.toString()
            }));
        }
    });
});

// Création du serveur WebSocket lié au serveur HTTP
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    console.log('Nouveau client WebSocket connecté');
    ws.send('Bienvenue sur le WebSocket !');

    ws.on('message', (message) => {
        console.log('Message reçu du client :', message.toString());
        ws.send(`Echo : ${message}`);
    });

    ws.on('close', () => {
        console.log('Client WebSocket déconnecté');
    });
});

server.listen(PORT, () => {
    console.log(`Node server is running on http://localhost:${PORT}`);
    console.log(`WebSocket server is running on ws://localhost:${PORT}`);
});