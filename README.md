# Développement
## Installation des dépendances.
```
sudo scripts/setup-env.sh
```

## Configuration
Copier le fichier CONFIG.EXAMPLE.ini vers CONFIG.ini,
et remplir chacun des champs comme indiqué dans le fichier.

## Mise à jour du client
Après un changement de CONFIG.ini, ou une mise à jour distance du client,
lancer le script :
```
sudo scripts/update-client.sh
```

## Initialisation du repos
```
npm install
```

## Démarrage
```
npm start
```

# Mise en production

## Configuration
Copier le fichier CONFIG.EXAMPLE.ini vers CONFIG.ini,
et remplir chacun des champs comme indiqué dans le fichier.

## Installation
Exécuter :
```
sudo ./install.sh
```

# Mises à jour 

## Mise à jour totale (avec maj git)
```
sudo ./update.sh
```

# A faire après une mise à jour de CONFIG.ini
Après modification de CONFIG.ini, lancer
```
scripts/update-config-ini.sh
```