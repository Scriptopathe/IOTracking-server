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
$ npm install
$ tsd install
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

## Mise à jour
```
sudo ./update.sh
```
