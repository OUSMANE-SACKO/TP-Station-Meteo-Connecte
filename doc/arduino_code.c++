#include "DHT.h"

// Définition des broches
#define DHTPIN 4
#define DHTTYPE DHT22
DHT dht(DHTPIN, DHTTYPE);

const int bouton = 13;
const int blueLed = 14;
const int redLed = 12;

// Variables pour stocker les mesures
float temperatureC = 0;
float temperatureF = 0;
float humidite = 0;
int etatBouton;
unsigned long dernierRefresh = 0;
const unsigned long intervalRefresh = 2000; // Lecture toutes les 2 secondes

void setup() {
  pinMode(bouton, INPUT_PULLUP);
  pinMode(blueLed, OUTPUT);
  pinMode(redLed, OUTPUT);
  
  Serial.begin(9600);
  Serial.println("Initialisation station météo...");
  
  dht.begin();
  
  // Attendre que le capteur soit prêt
  delay(2000);
  Serial.println("Capteur DHT22 initialisé");
  Serial.println("------------------");
}

void loop() {
  etatBouton = digitalRead(bouton);
  
  // Lecture des capteurs toutes les 2 secondes (pas à chaque loop)
  if (millis() - dernierRefresh >= intervalRefresh) {
    dernierRefresh = millis();
    
    // Lecture de l'humidité
    humidite = dht.readHumidity();
    
    // Lecture de la température en Celsius
    temperatureC = dht.readTemperature();
    
    // Vérification si les lectures sont valides
    if (isnan(humidite) || isnan(temperatureC)) {
      Serial.println("ERREUR: Lecture du capteur échouée!");
      digitalWrite(blueLed, LOW);
      digitalWrite(redLed, HIGH);
      delay(1000);
      return; // Sortir de cette itération si erreur
    }
    
    // Conversion en Fahrenheit
    temperatureF = (temperatureC * 1.8) + 32;
  }
  
  // Affichage selon l'état du bouton
  if (etatBouton == HIGH) {  
    // Bouton NON appuyé → Celsius
    Serial.print("Temperature = ");
    Serial.print(temperatureC);
    Serial.println(" °C");
    
    digitalWrite(blueLed, HIGH);
    digitalWrite(redLed, LOW);
  } 
  else {  
    // Bouton appuyé → Fahrenheit
    Serial.print("Temperature = ");
    Serial.print(temperatureF);
    Serial.println(" °F");
    
    digitalWrite(redLed, HIGH);
    digitalWrite(blueLed, LOW);
  }
  
  // Affichage de l'humidité
  Serial.print("Humidite = ");
  Serial.print(humidite);
  Serial.println(" %");
  Serial.println("------------------");
  
  delay(1000); // Délai pour lisibilité dans le moniteur série
}