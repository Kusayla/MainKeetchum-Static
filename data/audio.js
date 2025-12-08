// Chemins des fichiers audio (désactivés pour l'instant - peut être ajouté plus tard)
const audioPaths = {
  map: './audio/map.mp3',
  initBattle: './audio/initBattle.mp3',
  battle: './audio/battle.mp3',
  tackleHit: './audio/tackleHit.mp3',
  fireballHit: './audio/fireballHit.mp3',
  initFireball: './audio/initFireball.mp3',
  victory: './audio/victory.mp3'
};

// Création d'une fonction pour initialiser les sons (désactivé si fichiers absents)
function createSound(soundKey, volume = 0.1) {
  // Créer un son silencieux si le fichier n'existe pas
  return {
    play: function() { console.log('Audio:', soundKey); },
    stop: function() { console.log('Audio stop:', soundKey); }
  };
}

// Utilisation de la fonction pour créer chaque son
const audio = {
  Map: createSound('map'),
  initBattle: createSound('initBattle'),
  battle: createSound('battle'),
  tackleHit: createSound('tackleHit'),
  fireballHit: createSound('fireballHit'),
  initFireball: createSound('initFireball'),
  victory: createSound('victory')
};
