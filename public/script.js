const audio = document.getElementById('audio');
const playButton = document.getElementById('play-button');
const loader = document.getElementById('loader');
const trackName = document.getElementById('track-name');
const canvas = document.getElementById('visualizer');
const ctx = canvas.getContext('2d');

let currentColorHue = 0;

const tracks = [
    "assets/audio/track1.mp3",
    "assets/audio/track2.mp3"
];

let trackIndex = 0;
let analyser, bufferLength, dataArray;

// Configuration du visualiseur
function setupVisualizer() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

    const source = audioContext.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioContext.destination);
    
    drawVisualizer();
}

// Dessiner le visualiseur
function drawVisualizer() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    analyser.getByteFrequencyData(dataArray);
    
    const barWidth = (canvas.width / bufferLength) * 2.5;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
        const barHeight = dataArray[i];
        const r = barHeight + 25 * (i / bufferLength);
        const g = 250 * (i / bufferLength);
        const b = 50;

        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        
        x += barWidth + 1;
    }

    requestAnimationFrame(drawVisualizer);
}

// Charger la chanson
function loadTrack() {
    audio.src = tracks[trackIndex];
    trackName.textContent = `🎵 En lecture : ${tracks[trackIndex].split('/').pop()}`;
    
    // Changer la couleur de fond à chaque chanson
    currentColorHue = (currentColorHue + 80) % 360;
    document.body.style.filter = `hue-rotate(${currentColorHue}deg)`;

    audio.play();
    setupVisualizer();

    // Passer à la chanson suivante une fois la lecture terminée
    audio.addEventListener('ended', () => {
        trackIndex = (trackIndex + 1) % tracks.length;
        loadTrack();
    });
}

// Démarrer la radio au clic sur le bouton
playButton.addEventListener('click', () => {
    loader.style.display = 'block'; // Afficher le loader
    setTimeout(() => {
        loader.style.display = 'none'; // Cacher le loader après un délai
        loadTrack(); // Charger la première chanson
    }, 1000);
});
