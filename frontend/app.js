// ============================================
// WEBSOCKET CONNECTION
// ============================================

// Déterminer l'URL du serveur WebSocket
const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const wsHost = window.location.hostname;
const wsPort = 3001;
const wsUrl = `${wsProtocol}//${wsHost}:${wsPort}`;

let ws = null;
let isConnected = false;
let currentUnit = 'C';  // Unité courante
let dataHistory = [];   // Historique des données

console.log('[APP] WebSocket URL:', wsUrl);

// ============================================
// CONNEXION WEBSOCKET
// ============================================

function connectWebSocket() {
  console.log('[WS] Tentative de connexion...');
  
  ws = new WebSocket(wsUrl);
  
  ws.onopen = () => {
    console.log('[WS] ✅ Connecté au bridge');
    isConnected = true;
    updateConnectionStatus(true);
    addDebugMessage('Connecté au bridge MQTT');
  };
  
  ws.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data);
      
      if (message.type === 'sensor_data') {
        console.log('[WS] Données reçues:', message.data);
        handleSensorData(message.data);
      } else if (message.type === 'connection') {
        console.log('[WS]', message.message);
      }
    } catch (error) {
      console.error('[WS] Erreur parsing:', error);
    }
  };
  
  ws.onerror = (error) => {
    console.error('[WS] ❌ Erreur:', error);
    addDebugMessage('Erreur de connexion WebSocket');
  };
  
  ws.onclose = () => {
    console.log('[WS] ❌ Déconnecté');
    isConnected = false;
    updateConnectionStatus(false);
    addDebugMessage('Déconnecté du bridge');
    
    // Reconnecter automatiquement après 3 secondes
    setTimeout(() => {
      console.log('[WS] Tentative de reconnexion...');
      connectWebSocket();
    }, 3000);
  };
}

// ============================================
// TRAITEMENT DES DONNÉES
// ============================================

function handleSensorData(data) {
  const temp = parseFloat(data.temperature);
  const humidity = parseFloat(data.humidity);
  const unit = data.unit || 'C';
  
  // Mettre à jour l'affichage
  displayTemperature(temp, unit);
  displayHumidity(humidity);
  
  // Déterminer si mode simulation
  if (data.simulation !== undefined) {
    updateSimulationMode(data.simulation);
  }
  
  // Ajouter à l'historique
  addToHistory(temp, humidity, unit);
  
  // Mettre à jour l'heure
  updateLastUpdate();
}

function displayTemperature(temp, unit) {
  const tempElement = document.getElementById('tempValue');
  const displayUnit = unit === 'F' ? '°F' : '°C';
  tempElement.textContent = temp.toFixed(1) + ' ' + displayUnit;
  
  // Mettre à jour le style de la carte
  const card = document.querySelector('.temperature-card');
  if (temp > 25) {
    card.classList.add('hot');
    card.classList.remove('cold', 'comfortable');
  } else if (temp < 15) {
    card.classList.add('cold');
    card.classList.remove('hot', 'comfortable');
  } else {
    card.classList.add('comfortable');
    card.classList.remove('hot', 'cold');
  }
  
  // Mettre à jour les boutons d'unité
  currentUnit = unit;
  updateUnitButtons();
}

function displayHumidity(humidity) {
  const humidityElement = document.getElementById('humidityValue');
  const humidityBar = document.getElementById('humidityBar');
  
  humidityElement.textContent = humidity.toFixed(1) + ' %';
  humidityBar.style.width = humidity + '%';
  
  // Ajouter des classes pour la couleur
  const card = document.querySelector('.humidity-card');
  if (humidity > 70) {
    card.classList.add('humid');
    card.classList.remove('dry');
  } else if (humidity < 30) {
    card.classList.add('dry');
    card.classList.remove('humid');
  } else {
    card.classList.remove('humid', 'dry');
  }
}

function addToHistory(temp, humidity, unit) {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('fr-FR');
  
  dataHistory.unshift({
    time: timeStr,
    temperature: temp.toFixed(1),
    humidity: humidity.toFixed(1),
    unit: unit
  });
  
  // Garder les 20 dernières entrées
  if (dataHistory.length > 20) {
    dataHistory.pop();
  }
  
  // Mettre à jour l'affichage
  updateHistoryTable();
}

function updateHistoryTable() {
  const tableBody = document.getElementById('dataTableBody');
  
  if (dataHistory.length === 0) {
    tableBody.innerHTML = '<div class="empty-message">En attente de données...</div>';
    return;
  }
  
  tableBody.innerHTML = dataHistory.map(entry => `
    <div class="table-row">
      <div class="col">${entry.time}</div>
      <div class="col">${entry.temperature}°${entry.unit}</div>
      <div class="col">${entry.humidity}%</div>
      <div class="col">${entry.unit === 'C' ? 'Celsius' : 'Fahrenheit'}</div>
    </div>
  `).join('');
}

// ============================================
// CONTRÔLE
// ============================================

function changeUnit(unit) {
  console.log('[APP] Changement d\'unité:', unit);
  
  if (!isConnected) {
    alert('Pas connecté au bridge!');
    return;
  }
  
  // Envoyer la commande
  const command = {
    type: 'command',
    unit: unit
  };
  
  ws.send(JSON.stringify(command));
  addDebugMessage(`Commande envoyée: unit=${unit}`);
}

function updateUnitButtons() {
  const btnC = document.getElementById('btnCelsius');
  const btnF = document.getElementById('btnFahrenheit');
  
  if (currentUnit === 'C') {
    btnC.classList.add('active');
    btnF.classList.remove('active');
  } else {
    btnF.classList.add('active');
    btnC.classList.remove('active');
  }
}

function updateSimulationMode(isSimulation) {
  const badge = document.getElementById('simulationMode');
  if (isSimulation) {
    badge.textContent = '🔄 Mode simulation';
    badge.classList.add('simulation');
  } else {
    badge.textContent = '✅ Mode réel';
    badge.classList.remove('simulation');
  }
}

function updateConnectionStatus(connected) {
  const status = document.getElementById('wsStatus');
  if (connected) {
    status.textContent = '✅ Connecté';
    status.classList.add('connected');
    status.classList.remove('disconnected');
  } else {
    status.textContent = '❌ Déconnecté';
    status.classList.add('disconnected');
    status.classList.remove('connected');
  }
}

function updateLastUpdate() {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('fr-FR');
  document.getElementById('lastUpdate').textContent = timeStr;
}

function addDebugMessage(message) {
  const timestamp = new Date().toLocaleTimeString('fr-FR');
  const debugElem = document.getElementById('debugMessage');
  debugElem.textContent = `[${timestamp}] ${message}`;
}

// ============================================
// INITIALISATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  console.log('[APP] ✨ Initialisation...');
  
  // Afficher l'URL WebSocket
  document.getElementById('wsUrl').textContent = wsUrl;
  
  // Connecter le WebSocket
  connectWebSocket();
  
  // Mettre à jour l'heure toutes les secondes
  setInterval(updateLastUpdate, 1000);
  
  console.log('[APP] ✅ Prête!');
});
