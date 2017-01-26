# IoTracking Server

Server applicatif du système IoTracking.
Ce serveur fournit l'API REST pour le client, et récupère les données des devices
depuis le serveur LoRa.

# Mise en production

## Configuration
Copier le fichier CONFIG.EXAMPLE.ini vers CONFIG.ini,
et remplir chacun des champs comme indiqué dans le fichier.

## Installation
L'installation est automatisée et requiert une connexion stable à internet.
Pour lancer l'installation, exécuter le script :
```
sudo ./install.sh
```

Ce script va installer toutes les dépendances, compiler le client et le serveur,
leur appliquer la configuration présente dans CONFIG.ini, et installer le serveur
dans systemd : cela a pour effet de le lancer au démarrage de la machine, et de 
le relancer automatiquement en cas de crash.

# Mises à jour 

## Mise à jour totale (avec maj git)
```
sudo scripts/update.sh
```

## A faire après une mise à jour de CONFIG.ini
Après modification de CONFIG.ini, lancer
```
scripts/update-config-ini.sh
```

# Développement

## Installation des dépendances.
```
sudo scripts/setup-env.sh
npm install
```

## Configuration
Copier le fichier CONFIG.EXAMPLE.ini vers CONFIG.ini,
et remplir chacun des champs comme indiqué dans le fichier.

Lors d'un changement de CONFIG.ini, lancer le script : 
```
scripts/update-config-ini.sh
```


## Mise à jour du client
Après un changement de CONFIG.ini, ou une mise à jour distance du client,
lancer le script :
```
sudo scripts/update-client.sh
```


## Démarrage du serveur
```
npm start
```
