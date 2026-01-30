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

    try {
        // Parser le message MQTT comme JSON
        const data = JSON.parse(message.toString());
        
        // On envoie les données reformatées aux clients WebSocket connectés
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                    type: 'sensor_data',
                    data: {
                        temperature: data.temperature || data.temp || 0,
                        humidity: data.humidity || data.hum || 0,
                        unit: data.unit || 'C',
                        simulation: data.simulation !== undefined ? data.simulation : false
                    }
                }));
            }
        });
    } catch (error) {
        console.error('Erreur parsing message MQTT:', error);
    }
});

// Création du serveur WebSocket lié au serveur HTTP
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    console.log('Nouveau client WebSocket connecté');
    ws.send(JSON.stringify({
        type: 'connection',
        message: 'Connecté au bridge MQTT'
    }));

    ws.on('message', (message) => {
        console.log('Message reçu du client :', message.toString());
    });

    ws.on('close', () => {
        console.log('Client WebSocket déconnecté');
    });
});

server.listen(PORT, () => {
    console.log(`Node server is running on http://localhost:${PORT}`);
    console.log(`WebSocket server is running on ws://localhost:${PORT}`);
});