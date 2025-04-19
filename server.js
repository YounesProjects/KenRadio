const express = require('express');
const app = express();
const path = require('path');

// Configure ton dossier de musique
const musicDirectory = path.join(__dirname, 'music');

// Fonction pour récupérer la musique et l'envoyer
app.get('/current-track', (req, res) => {
  // Sélectionner un fichier aléatoire ou celui en cours de lecture
  const track = { file: 'example.mp3', startAt: 0 }; // Change ça pour utiliser ta logique réelle
  res.json(track);
});

// Serve les fichiers audio depuis un répertoire
app.use('/stream', express.static(musicDirectory));

app.listen(8000, () => {
  console.log('Serveur lancé sur http://localhost:8000');
});
