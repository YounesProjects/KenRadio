const audio = document.getElementById('audio');
const trackName = document.getElementById('track-name');
const loader = document.getElementById('loader');
const playButton = document.getElementById('play-button');
const canvas = document.getElementById('visualizer');
const ctx = canvas.getContext('2d');
let currentColorHue = 0;

async function loadTrack() {
  const res = await fetch('/current-track');
  const { file, startAt } = await res.json();

  audio.src = `/stream/${encodeURIComponent(file)}`;
  audio.currentTime = startAt;
  trackName.textContent = `🎵 Playing : ${file}`;

  currentColorHue = (currentColorHue + 80) % 360;
  document.body.style.filter = `hue-rotate(${currentColorHue}deg)`;

  // Démarrage avec volume 0
  audio.volume = 0;
  audio.play().then(() => {
    let fadeIn = setInterval(() => {
      if (audio.volume + 0.05 >= 1) {
        audio.volume = 1;
        clearInterval(fadeIn);
      } else {
        audio.volume += 0.05;
      }
    }, 100);
  }).catch(err => console.error('Erreur lecture :', err));

  // Cacher le loader et afficher le bouton Play
  loader.style.display = 'none';
  playButton.style.display = 'none';
}

function setupVisualizer() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  const audioCtx = new AudioContext();
  const analyser = audioCtx.createAnalyser();
  const source = audioCtx.createMediaElementSource(audio);
  source.connect(analyser);
  analyser.connect(audioCtx.destination);

  analyser.fftSize = 256;  // Augmenter la taille de l'FFT pour plus de précision
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  canvas.width = window.innerWidth;
  canvas.height = 150;

  // Style du visualiseur
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.lineCap = 'round';

  // Appliquer un fond dynamique qui change selon la musique
  function applyBackgroundEffect() {
    const r = Math.floor(255 * (Math.sin(audio.currentTime / 10) + 1) / 2);
    const g = Math.floor(255 * (Math.cos(audio.currentTime / 8) + 1) / 2);
    const b = Math.floor(255 * (Math.sin(audio.currentTime / 12) + 1) / 2);
    document.body.style.background = `rgb(${r}, ${g}, ${b})`;
  }

  // Lissage des données audio pour éviter une sensibilité excessive
  let previousData = new Uint8Array(bufferLength);
  function smoothFrequencyData(dataArray) {
    for (let i = 0; i < bufferLength; i++) {
      dataArray[i] = (dataArray[i] + previousData[i]) / 2;  // Moyenne pour lisser
      previousData[i] = dataArray[i];  // Sauvegarde les données actuelles pour la prochaine itération
    }
  }

  // Fonction de dessin
  function draw() {
    requestAnimationFrame(draw);
    analyser.getByteFrequencyData(dataArray);
    
    smoothFrequencyData(dataArray);  // Appliquer le lissage

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const barWidth = (canvas.width / bufferLength) * 3;  // Barres plus larges
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const barHeight = dataArray[i];
      const r = barHeight + 25 * (i / bufferLength);
      const g = 250 * (i / bufferLength);
      const b = 50;

      // Deviens plus dynamique en changeant la couleur en temps réel
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;

      // Créer un effet 3D dynamique
      ctx.save();
      ctx.translate(x, canvas.height - barHeight); // Positionnement des barres
      ctx.scale(1, 1 + (barHeight / 100)); // Hauteur de la barre plus dynamique

      // Barres plus larges avec plus d'effet de profondeur
      ctx.fillRect(0, 0, barWidth, barHeight);
      ctx.restore();

      x += barWidth + 1; // Espacement entre les barres
    }

    applyBackgroundEffect();  // Appliquer l'effet de fond dynamique
  }

  draw();
}

playButton.addEventListener('click', async () => {
  await loadTrack();
  setupVisualizer();
  // Enlever le bouton Play après le démarrage
  playButton.style.display = 'none';
});

// Détecte quand la musique est terminée et charge la suivante
audio.addEventListener('ended', async () => {
  await loadTrack();
  setupVisualizer();
  // Rejoue la nouvelle chanson
  audio.play();
});

window.addEventListener('DOMContentLoaded', () => {
  playButton.style.display = 'block';
});
