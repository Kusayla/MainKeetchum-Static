// Récupérer l'élément contenant les chemins
const audioPathData = document.getElementById('audioPaths');

// Création d'une fonction pour initialiser les sons avec les chemins récupérés
function createSound(soundKey, volume = 0.1) {
  return new Howl({
      src: [audioPathData.dataset[soundKey]],
      html5: true,
      volume: volume
  });
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
