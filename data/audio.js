// Récupérer l'élément contenant les chemins
const audioPathData = document.getElementById('audioPaths');

console.log('🔊 Audio System Initializing...');
console.log('audioPaths element found:', !!audioPathData);

if (audioPathData) {
  console.log('Available audio paths:', Object.keys(audioPathData.dataset));
}

// Création d'une fonction pour initialiser les sons avec les chemins récupérés
function createSound(soundKey, volume = 0.1, isLargeFile = false) {
  if (!audioPathData || !audioPathData.dataset[soundKey]) {
    console.warn(`❌ Audio path not found for: ${soundKey}`);
    return createDummyAudio();
  }

  const path = audioPathData.dataset[soundKey];
  console.log(`🎵 Loading sound: ${soundKey} from ${path}`);

  const config = {
    src: [path],
    volume: volume,
    onload: function() {
      console.log(`✅ ${soundKey} loaded successfully`);
    },
    onloaderror: function(id, error) {
      console.error(`❌ Failed to load ${soundKey}:`, error);
    },
    onplay: function() {
      console.log(`▶️ Playing: ${soundKey}`);
    }
  };

  // Seulement les gros fichiers de musique utilisent html5: true
  if (isLargeFile) {
    config.html5 = true;
  } else {
    // Les petits effets sonores utilisent le mode sprite (plus performant)
    config.pool = 5; // Pool de 5 instances max par son
  }

  try {
    return new Howl(config);
  } catch (error) {
    console.error(`❌ Error creating Howl for ${soundKey}:`, error);
    return createDummyAudio();
  }
}

// Fonction spéciale pour créer la musique de fond avec loop
function createLoopingMusic(soundKey, volume = 0.1) {
  if (!audioPathData || !audioPathData.dataset[soundKey]) {
    console.warn(`❌ Audio path not found for: ${soundKey}`);
    return createDummyAudio(); // Retourne un objet vide fonctionnel
  }

  const path = audioPathData.dataset[soundKey];
  console.log(`🎶 Loading looping music: ${soundKey} from ${path}`);

  try {
    return new Howl({
      src: [path],
      html5: false,  // NE PAS utiliser html5 pour éviter le pool exhausted
      volume: volume,
      loop: true,  // Musique en boucle
      preload: true, // Précharger la musique
      format: ['ogg'], // Spécifier le format
      onload: function() {
        console.log(`✅ ${soundKey} music loaded successfully`);
      },
      onloaderror: function(id, error) {
        console.error(`❌ Failed to load music ${soundKey}:`, error);
      },
      onplay: function() {
        console.log(`▶️ Playing music: ${soundKey}`);
      },
      onplayerror: function(id, error) {
        console.error(`❌ Error playing music ${soundKey}:`, error);
        console.log('🔓 Attempting to unlock audio...');
        const self = this;
        this.once('unlock', function() {
          console.log('🔓 Audio unlocked! Retrying play...');
          self.play();
        });
      }
    });
  } catch (error) {
    console.error(`❌ Error creating audio for: ${soundKey}`, error);
    return createDummyAudio();
  }
}

// Crée un objet audio vide qui ne fait rien (évite les erreurs)
function createDummyAudio() {
  console.log('⚠️ Creating dummy audio object');
  return {
    play: function() { console.log('🔇 Dummy audio play called'); return this; },
    stop: function() { console.log('🔇 Dummy audio stop called'); return this; },
    pause: function() { console.log('🔇 Dummy audio pause called'); return this; },
    volume: function() { return this; },
    fade: function() { return this; }
  };
}

// Utilisation de la fonction pour créer chaque son
const audio = audioPathData ? {
  Map: createLoopingMusic('map', 0.2),          // Musique de map avec loop (volume augmenté pour test)
  initBattle: createSound('initBattle', 0.3),   // Petit fichier
  battle: createLoopingMusic('battle', 0.2),    // Musique de combat avec loop (volume augmenté)
  tackleHit: createSound('tackleHit', 0.3),     // Petit fichier
  fireballHit: createSound('fireballHit', 0.3), // Petit fichier
  initFireball: createSound('initFireball', 0.3), // Petit fichier
  victory: createSound('victory', 0.3),         // Petit fichier
  initMexico: createSound('initMexico', 0.3),   // Petit fichier
  mexicoHit: createSound('mexicoHit', 0.3),     // Petit fichier
  initIce: createSound('initIce', 0.3),         // Petit fichier
  iceHit: createSound('iceHit', 0.3)            // Petit fichier
} : null;

if (audio) {
  console.log('✅ Audio system initialized with:', Object.keys(audio));
} else {
  console.error('❌ Audio system failed to initialize!');
}

// Test audio au clic (pour débloquer l'audio dans les navigateurs)
document.addEventListener('click', function initAudio() {
  console.log('👆 First click detected - attempting to unlock audio');
  if (audio && audio.Map) {
    audio.Map.play();
    console.log('🎵 Map music play attempted');
  }
  // Ne s'exécute qu'une fois
  document.removeEventListener('click', initAudio);
}, { once: true });
