

const canvas = document.querySelector('#mainCanvas') || document.querySelector('canvas')
if (!canvas) {
  console.error('Canvas not found! Make sure #mainCanvas exists in the DOM.');
  throw new Error('Canvas element not found');
}

const c = canvas.getContext('2d')

canvas.width = 1024
canvas.height = 576

// Afficher les informations sur les contrôles
console.log('🎮 Game Controls:');
console.log('  Movement: WASD (QWERTY) / ZQSD (AZERTY) / Arrow Keys ← ↑ → ↓');
console.log('  Sprint: B or Shift');
console.log('  Interact: Space');
console.log('  Bag: I or 🎒 button');
console.log('  Multi-keyboard support enabled! ✨');

const normalSpeed = 3;
const sprintSpeed = 6;

let currentSpeed = normalSpeed; // Vitesse actuelle

// Fonction globale pour afficher une notification animée
window.showItemNotification = function(icon, title, description) {
  const notification = document.getElementById('itemNotification');
  const notificationIcon = document.getElementById('notificationIcon');
  const notificationTitle = document.getElementById('notificationTitle');
  const notificationDescription = document.getElementById('notificationDescription');

  if (!notification) return;

  // Set content
  notificationIcon.textContent = icon;
  notificationTitle.textContent = title;
  notificationDescription.textContent = description;

  // Show with animation
  notification.style.display = 'block';
  gsap.fromTo(notification,
    {
      opacity: 0,
      scale: 0.5,
      y: -50
    },
    {
      opacity: 1,
      scale: 1,
      y: 0,
      duration: 0.5,
      ease: 'back.out(1.7)'
    }
  );

  // Auto hide after 3 seconds
  setTimeout(() => {
    gsap.to(notification, {
      opacity: 0,
      scale: 0.8,
      y: 50,
      duration: 0.4,
      ease: 'back.in(1.7)',
      onComplete: () => {
        notification.style.display = 'none';
      }
    });
  }, 3000);
};

// Fonction globale pour donner le sac au joueur (définie tôt pour être accessible partout)
window.giveBagToPlayer = function() {
  if (window.hasReceivedBag) {
    console.log('Player already has the bag!');
    return;
  }

  window.hasReceivedBag = true;
  localStorage.setItem('hasReceivedBag', 'true');

  // Show bag button
  const bagButton = document.querySelector('#mobileBagButton');
  if (bagButton) {
    bagButton.style.display = 'block';
  }

  // Update bag system visibility
  if (typeof window.bagSystem !== 'undefined') {
    window.bagSystem.updateBagButtonVisibility();
  }

  // Show notification animation
  window.showItemNotification(
    '🎒',
    'You received a BAG!',
    'Press I to open your bag anytime!'
  );

  console.log('✅ Player received the BAG!');
};

// Variable globale pour suivre si le joueur a reçu le sac
// Charger depuis localStorage au démarrage
const savedBagStatus = localStorage.getItem('hasReceivedBag');
window.hasReceivedBag = savedBagStatus === 'true';

// Fonction globale pour RESET le jeu (pour les tests)
window.resetGameProgress = function() {
  // Clear all game progress
  localStorage.removeItem('hasReceivedBag');
  localStorage.removeItem('playerLevel');
  localStorage.removeItem('playerXP');

  // Reset global variables
  window.hasReceivedBag = false;
  window.hasDefeatedDragkatchu = false;

  // Hide bag button
  const bagButton = document.querySelector('#mobileBagButton');
  if (bagButton) {
    bagButton.style.display = 'none';
  }

  console.log('🔄 Game progress RESET! Refresh the page to start fresh.');
  console.log('Type: location.reload() to refresh');
};

// Fonction pour forcer le level (DEV ONLY)
window.setPlayerLevel = function(level) {
  if (!level || level < 1) {
    console.log('❌ Usage: setPlayerLevel(10)');
    return;
  }

  localStorage.setItem('playerLevel', level.toString());
  localStorage.setItem('playerXP', '0');

  console.log(`✅ Player level set to ${level}!`);
  console.log('🔄 Refresh the page or start a new battle to see the changes.');
  console.log('💡 TIP: Type location.reload() to refresh now!');
};

// Fonction pour level up instantané pendant un combat
window.levelUpNow = function(targetLevel = 10) {
  // Trouver le Pokemon du joueur
  let playerPokemon = null;

  if (typeof emby !== 'undefined' && emby) {
    playerPokemon = emby;
  } else if (typeof embyTrainer !== 'undefined' && embyTrainer) {
    playerPokemon = embyTrainer;
  }

  if (!playerPokemon) {
    console.log('❌ No active battle found! Start a battle first.');
    return;
  }

  const oldLevel = playerPokemon.level;

  // Level up to target
  while (playerPokemon.level < targetLevel) {
    playerPokemon.levelUp();
  }

  // Save
  localStorage.setItem('playerLevel', playerPokemon.level.toString());
  localStorage.setItem('playerXP', playerPokemon.experience.toString());

  // Update UI
  const levelDisplay = document.querySelector('#playerLevel') || document.querySelector('#playerLevelTrainer');
  if (levelDisplay) {
    levelDisplay.textContent = 'Lv' + playerPokemon.level;
  }

  // Update XP bar
  const xpBar = document.querySelector('#playerXPBar') || document.querySelector('#playerXPBarTrainer');
  const xpText = document.querySelector('#playerXP') || document.querySelector('#playerXPTrainer');
  const xpNeeded = document.querySelector('#playerXPNeeded') || document.querySelector('#playerXPNeededTrainer');

  if (xpBar) xpBar.style.width = '0%';
  if (xpText) xpText.textContent = '0';
  if (xpNeeded) xpNeeded.textContent = playerPokemon.experienceToNextLevel;

  // Re-render attack buttons if secret attack was learned
  if (playerPokemon.level >= 10) {
    const attacksBox = document.querySelector('#attacksBox') || document.querySelector('#attacksBoxTrainer');
    if (attacksBox) {
      attacksBox.replaceChildren();
      playerPokemon.attacks.forEach((attack) => {
        const button = document.createElement('button');
        button.innerHTML = attack.name;
        attacksBox.append(button);
      });
    }
  }

  console.log(`🎉 Leveled up from ${oldLevel} to ${playerPokemon.level}!`);
  if (playerPokemon.level >= 10) {
    console.log('🔥 Secret attack "???" is now available!');
    console.log('💀 Next time you faint, you\'ll transform into TRUMPY!');
  }
};

// Log helper message
console.log('💡 DEV TIPS:');
console.log('  - resetGameProgress() : Reset all game progress');
console.log('  - setPlayerLevel(10)  : Set level before starting a battle');
console.log('  - levelUpNow(10)      : Level up to 10 during an active battle');
console.log('  - location.reload()   : Refresh the page');

const collisionsMap = []
for (let i = 0; i < collisions.length; i += 70) {
  collisionsMap.push(collisions.slice(i, 70 + i))
  console.log(collisionsMap)
}

const battleZonesMap = []
for (let i = 0; i < battleZonesData.length; i += 70) {
  battleZonesMap.push(battleZonesData.slice(i, 70 + i))
}

const charactersMap = []
for (let i = 0; i < charactersMapData.length; i += 70) {
  charactersMap.push(charactersMapData.slice(i, 70 + i))
}
console.log(charactersMap)

const boundaries = []
const offset = {
  x: -780,
  y: -450
}

collisionsMap.forEach((row, i) => {
  row.forEach((symbol, j) => {
    if (symbol === 3073)
      boundaries.push(
        new Boundary({
          position: {
            x: j * Boundary.width + offset.x,
            y: i * Boundary.height + offset.y
          }
        })
      )
  })
})

const battleZones = []

battleZonesMap.forEach((row, i) => {
  row.forEach((symbol, j) => {
    if (symbol === 3073)
      battleZones.push(
        new Boundary({
          position: {
            x: j * Boundary.width + offset.x,
            y: i * Boundary.height + offset.y
          }
        })
      )
  })
})

const characters = []
const villagerImg = new Image()
villagerImg.src = './img/villager/Idle.png'

const oldManImg = new Image()
oldManImg.src = './img/oldMan/Idle.png'

const newCharacterImg = new Image();
newCharacterImg.src = './img/oldMan/Idle.png';

function simulateKeyPress(key) {
  const event = new KeyboardEvent('keydown', {
    key: key,
    bubbles: true,
    cancelable: true
  });
  document.dispatchEvent(event);
}

const newCharacter = new Character({
  position: {
    x: 2850, // Nouvelle position X
    y: 1470   // Nouvelle position Y
  },
  image: newCharacterImg,
  frames: {
    max: 4,
    hold: 60
  },
  scale: 3,
  dialogue: [
    "So you think you can handle my Dragkatchu?",
    "Let's see if you're worthy...",
    "If you beat me, I'll give you something special!",
    "Get ready to battle!"
  ],
  onComplete: () => {
    console.log("Dialogue terminé. Lancement de startTrainerDialog...");
  }
});

// Ajouter les dialogues spéciaux après la création
newCharacter.dialogueAfterVictory = [
  "Wow, I thought you were a paper hands,",
  "but maybe you have what it takes to be a diamond hands",
  "and hold to the moon.",
  "You've earned this...",
  "I found an ancient note with a password.",
  "It's written in Unown alphabet!",
  "I've added the note to your BAG.",
  "Open your bag (Press I) to see it.",
  "Study the symbols carefully to decipher it...",
  "Good luck, Degen!"
];

newCharacter.dialogueAfterDefeat = [
  "You lost against Dragkatchu!",
  "Want to try again?"
];

// Rendre newCharacter globalement accessible
window.newCharacter = newCharacter;

// ==================== KK CHARACTER (Satirical anti-racism) ====================
const kkImg = new Image();
kkImg.src = './img/kk.png';

const kkCharacter = new Character({
  position: {
    x: 1200,  // Déplacé vers la droite
    y: 1000   // Déplacé vers le bas
  },
  image: kkImg,
  frames: {
    max: 4,
    hold: 60
  },
  scale: 3,
  animate: true,  // ACTIVER L'ANIMATION !
  dialogue: [
    "Oh look, another 'tourist' in MY America...",
    "You know what's REALLY destroying this country?",
    "It's people who think they're 'superior'",
    "based on something as dumb as skin color!",
    "Hate doesn't make you powerful.",
    "It just makes you... pathetic.",
    "*attacks you with ignorance*"
  ],
  onInteractionComplete: () => {
    // Après le dialogue, "tuer" le joueur et respawn
    setTimeout(() => {
      respawnPlayer();
    }, 1000);
  }
});

// Rendre kkCharacter globalement accessible
window.kkCharacter = kkCharacter;

// Fonction pour respawner le joueur au point de départ
function respawnPlayer() {
  console.log('💀 KK killed you with ignorance! Respawning...');

  const overlappingDiv = document.querySelector('#overlappingDiv');
  const dialogueBox = document.querySelector('#characterDialogueBox');

  // Fermer la boîte de dialogue
  if (dialogueBox) {
    dialogueBox.style.display = 'none';
  }

  // Réinitialiser l'état d'interaction du joueur
  if (player) {
    player.isInteracting = false;
    player.interactionAsset = null;
  }

  // Fade to black
  gsap.to(overlappingDiv, {
    opacity: 1,
    duration: 1,
    onComplete: () => {
      // Recharger la page pour un vrai respawn
      // C'est la méthode la plus simple et la plus fiable
      location.reload();
    }
  });
}

// Ajoutez une classe spécifique à la boîte de dialogue de ce personnage
const dialogueBox = document.querySelector('#characterDialogueBox');
if (dialogueBox) {
  dialogueBox.classList.add('newsCharacterDialogue');
}

let gameState = {
  inDialogueWithNewCharacter: false,
  dialogueIndex: 0,
  waitingForBattle: false
};

// Variable globale pour le rematch
window.waitingForRematch = false;

// Variable globale pour suivre si le joueur a vaincu Dragkatchu
window.hasDefeatedDragkatchu = false;

function handleDialogue(character) {
  if (!gameState.inDialogueWithNewCharacter) return;

  const dialogueBox = document.getElementById('dialogueBox');
  if (dialogueBox && gameState.dialogueIndex < character.dialogue.length) {
    dialogueBox.innerHTML = character.dialogue[gameState.dialogueIndex];
    gameState.dialogueIndex++;
  } else {
    console.log("Dialogue terminé. Lancement du combat.");
    launchBattle();
    gameState.inDialogueWithNewCharacter = false;
    gameState.dialogueIndex = 0;
  }
}

function startDialogueWithNewCharacter() {
  gameState.inDialogueWithNewCharacter = true;
  gameState.dialogueIndex = 0;
}

function calculateDistance(position1, position2) {
  const dx = position1.x - position2.x;
  const dy = position1.y - position2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function checkProximityAndLaunchBattle() {
  if (!shouldCheckDistance) {
    return;
  }

  const p = window.player;
  const nc = window.newCharacter;

  if (!p || !nc) return;

  const playerPosition = p.position;
  const newCharacterPosition = nc.position;
  const distance = calculateDistance(playerPosition, newCharacterPosition);

  const proximityThreshold = 75;

  if (distance <= proximityThreshold) {
    // Vérifier si le joueur a déjà vaincu Dragkatchu
    if (window.hasDefeatedDragkatchu) {
      // Ne pas relancer le combat, juste désactiver la vérification
      shouldCheckDistance = false;
      return;
    } else {
      // Afficher d'abord le dialogue initial
      showPreBattleDialogue();
      shouldCheckDistance = false;
    }
  }

  requestAnimationFrame(checkProximityAndLaunchBattle);
}

let shouldCheckDistance = true;

function showPreBattleDialogue() {
  // Ne pas afficher le dialogue de pré-combat si le joueur a déjà gagné
  if (window.hasDefeatedDragkatchu) {
    return;
  }

  setTimeout(() => {
    const nc = window.newCharacter;
    const p = window.player;

    if (nc) {
      // Sauvegarder le dialogue original seulement la première fois
      if (!nc.originalDialogue && !window.hasDefeatedDragkatchu) {
        nc.originalDialogue = [...nc.dialogue];
      }

      // Si on n'a pas encore vaincu Dragkatchu, utiliser le dialogue original
      if (!window.hasDefeatedDragkatchu && nc.originalDialogue) {
        nc.dialogue = [...nc.originalDialogue];
      }

      nc.dialogueIndex = 0;
      const dialogueBox = document.querySelector('#characterDialogueBox');
      if (dialogueBox) {
        dialogueBox.innerHTML = nc.dialogue[0];
        dialogueBox.style.display = 'flex';
        p.isInteracting = true;
        p.interactionAsset = nc;
        gameState.waitingForBattle = true;
      }
    }
  }, 500);
}

function launchBattle() {
  console.log("Lancement du combat");

  // Fermer le sac si il est ouvert
  if (typeof window.bagSystem !== 'undefined' && window.bagSystem.isOpen) {
    window.bagSystem.closeBag();
  }

  forceStartBattle();
}

// Fonction globale pour afficher le dialogue de victoire (appelée depuis trainer.js)
window.showVictoryDialogueGlobal = function() {
  // Marquer que le joueur a vaincu Dragkatchu ET arrêter la vérification de proximité
  window.hasDefeatedDragkatchu = true;
  shouldCheckDistance = false;

  // Ajouter l'item "Unknown Note" au sac
  if (typeof window.bagSystem !== 'undefined') {
    window.bagSystem.addItem({
      id: 'mysterious_note',
      name: 'Unknown Note',
      icon: '📜',
      description: 'A mysterious note with a password...'
    });
  }

  setTimeout(() => {
    const nc = window.newCharacter;
    const p = window.player;

    if (nc && nc.dialogueAfterVictory) {
      // Changer le dialogue pour le dialogue de victoire
      nc.dialogue = [...nc.dialogueAfterVictory];
      nc.originalDialogue = [...nc.dialogueAfterVictory];
      nc.dialogueIndex = 0;

      const dialogueBox = document.querySelector('#characterDialogueBox');
      if (dialogueBox) {
        dialogueBox.innerHTML = nc.dialogue[0];
        dialogueBox.style.display = 'flex';
        p.isInteracting = true;
        p.interactionAsset = nc;
        gameState.waitingForBattle = false;
      }
    }
  }, 500);
}

// Variables pour le système de choix
let currentChoiceIndex = 0;
let isShowingChoices = false;
let choiceCallback = null;

function showDialogueChoices(callback) {
  isShowingChoices = true;
  currentChoiceIndex = 0;
  choiceCallback = callback;

  const choicesDiv = document.querySelector('#dialogueChoices');
  const choices = choicesDiv.querySelectorAll('.choice-option');

  // Réinitialiser les flèches
  choices.forEach((choice, index) => {
    const arrow = choice.querySelector('.choice-arrow');
    arrow.style.visibility = index === 0 ? 'visible' : 'hidden';
  });

  choicesDiv.style.display = 'block';
}

function hideDialogueChoices() {
  isShowingChoices = false;
  choiceCallback = null;
  document.querySelector('#dialogueChoices').style.display = 'none';
}

function updateChoiceSelection() {
  const choices = document.querySelectorAll('.choice-option');
  choices.forEach((choice, index) => {
    const arrow = choice.querySelector('.choice-arrow');
    arrow.style.visibility = index === currentChoiceIndex ? 'visible' : 'hidden';
  });
}

// Fonction globale pour afficher le dialogue de défaite (appelée depuis trainer.js)
window.showDefeatDialogueGlobal = function() {
  setTimeout(() => {
    const nc = window.newCharacter;
    const p = window.player;

    if (nc && nc.dialogueAfterDefeat) {
      nc.dialogue = [...nc.dialogueAfterDefeat];
      nc.dialogueIndex = 0;

      const dialogueBox = document.querySelector('#characterDialogueBox');
      if (dialogueBox) {
        dialogueBox.innerHTML = nc.dialogue[0];
        dialogueBox.style.display = 'flex';
        p.isInteracting = true;
        p.interactionAsset = nc;
        window.waitingForRematch = true;
      }
    }
  }, 500);
}

function forceStartBattle() {
  if (animationId !== null) {
    window.cancelAnimationFrame(animationId);
    animationId = null;
  }

  // Fermer le sac si il est ouvert
  if (typeof window.bagSystem !== 'undefined' && window.bagSystem.isOpen) {
    window.bagSystem.closeBag();
  }

  if (typeof audio !== 'undefined' && audio) {
    if (audio.Map) audio.Map.stop();
    if (audio.initBattle) audio.initBattle.play();
    if (audio.battle) audio.battle.play();
  }

  battle.initiated = true;

  gsap.to('#overlappingDiv', {
    opacity: 1,
    repeat: 3,
    yoyo: true,
    duration: 0.4,
    onComplete() {
      gsap.to('#overlappingDiv', {
        opacity: 1,
        duration: 0.4,
        onComplete() {
          // Lancer le combat trainer contre Dragkatchu
          initBattl();
          animateTrainerBattle();
          gsap.to('#overlappingDiv', {
            opacity: 0,
            duration: 0.4
          });
        }
      });
    }
  });
}

function startTrainerBattle() {
  console.log("Initialisation du combat contre le dresseur...");
  battle.initiated = true;
  initBattle();
  animateBattle();
}

function startTrainerDialog(character, callback) {
  console.log("Démarrage du dialogue avec le personnage:", character);
  setTimeout(() => {
    console.log("Fin du dialogue avec le personnage.");
    callback();
  }, 2000);
}

characters.push(newCharacter);
characters.push(kkCharacter); // Ajouter KK character

charactersMap.forEach((row, i) => {
  row.forEach((symbol, j) => {
    // 1026 === villager
    if (symbol === 1026) {
      characters.push(
        new Character({
          position: {
            x: j * Boundary.width + offset.x,
            y: i * Boundary.height + offset.y
          },
          image: villagerImg,
          frames: {
            max: 4,
            hold: 60
          },
          scale: 3,
          animate: true,
          dialogue: [
            'Ah, a young trainer!',
            'You look like you\'re on a journey.',
            'Here, take this BAG.',
            'It will help you carry items you find.',
            'Press I to open it anytime!',
            'Good luck on your adventure!'
          ],
          onInteractionComplete: function() {
            // Give the bag to the player via global function
            console.log('🎒 onInteractionComplete called!');
            console.log('window.giveBagToPlayer exists?', typeof window.giveBagToPlayer === 'function');
            if (typeof window.giveBagToPlayer === 'function') {
              window.giveBagToPlayer();
            } else {
              console.error('❌ window.giveBagToPlayer is not defined!');
            }
          }
        })
      )
    }
    // 1031 === oldMan
    else if (symbol === 1031) {
      characters.push(
        new Character({
          position: {
            x: j * Boundary.width + offset.x,
            y: i * Boundary.height + offset.y
          },
          image: oldManImg,
          frames: {
            max: 4,
            hold: 60
          },
          scale: 3,
          dialogue: [
            'Hey there, trainer!',
            'I heard there\'s a tough trainer up ahead...',
            'They say he guards a secret password.',
            'You\'ll need to defeat him to get it!',
            'Train hard and level up your Pokemon!'
          ]
        })
      )
    }

    if (symbol !== 0) {
      boundaries.push(
        new Boundary({
          position: {
            x: j * Boundary.width + offset.x,
            y: i * Boundary.height + offset.y
          }
        })
      )
    }
  })
})

const image = new Image()
image.src = './img/PelletTown.png'

const foregroundImage = new Image()
foregroundImage.src = './img/foregroundObjects.png'

const playerDownImage = new Image()
playerDownImage.src = './img/playerDown.png'

const playerUpImage = new Image()
playerUpImage.src = './img/playerUp.png'

const playerLeftImage = new Image()
playerLeftImage.src = './img/playerLeft.png'

const playerRightImage = new Image()
playerRightImage.src = './img/playerRight.png'

const player = new Sprite({
  position: {
    x: canvas.width / 2 - 192 / 4 / 2,
    y: canvas.height / 2 - 68 / 2
  },
  image: playerDownImage,
  frames: {
    max: 4,
    hold: 10
  },
  sprites: {
    up: playerUpImage,
    left: playerLeftImage,
    right: playerRightImage,
    down: playerDownImage
  }
})

// Rendre player globalement accessible
window.player = player;

const background = new Sprite({
  position: {
    x: offset.x,
    y: offset.y
  },
  image: image
})

const foreground = new Sprite({
  position: {
    x: offset.x,
    y: offset.y
  },
  image: foregroundImage
})

const keys = {
  w: {
    pressed: false
  },
  a: {
    pressed: false
  },
  s: {
    pressed: false
  },
  d: {
    pressed: false
  },
  b: {
    pressed: false
  }
}

const movables = [
  background,
  ...boundaries,
  foreground,
  ...battleZones,
  ...characters
]
const renderables = [
  background,
  ...boundaries,
  ...battleZones,
  ...characters,
  newCharacter,
  player,
  foreground
]

const battle = {
  initiated: false
}

let animationId = null

function animate() {
  if (animationId !== null) {
    window.cancelAnimationFrame(animationId)
  }
  animationId = window.requestAnimationFrame(animate)
  renderables.forEach((renderable) => {
    renderable.draw()
  })

  let moving = true
  player.animate = false

  if (battle.initiated) return

  // activate a battle
  if (keys.w.pressed || keys.a.pressed || keys.s.pressed || keys.d.pressed) {
    for (let i = 0; i < battleZones.length; i++) {
      const battleZone = battleZones[i]
      const overlappingArea =
        (Math.min(
          player.position.x + player.width,
          battleZone.position.x + battleZone.width
        ) -
          Math.max(player.position.x, battleZone.position.x)) *
        (Math.min(
          player.position.y + player.height,
          battleZone.position.y + battleZone.height
        ) -
          Math.max(player.position.y, battleZone.position.y))
      if (
        rectangularCollision({
          rectangle1: player,
          rectangle2: battleZone
        }) &&
        overlappingArea > (player.width * player.height) / 2 &&
        Math.random() < 0.01
      ) {
        // deactivate current animation loop
        if (animationId !== null) {
          window.cancelAnimationFrame(animationId)
          animationId = null
        }

        if (typeof audio !== 'undefined' && audio) {
          if (audio.Map) audio.Map.stop()
          if (audio.initBattle) audio.initBattle.play()
          if (audio.battle) audio.battle.play()
        }

        battle.initiated = true;

        // Fermer le sac si il est ouvert
        if (typeof window.bagSystem !== 'undefined' && window.bagSystem.isOpen) {
          window.bagSystem.closeBag();
        }

        gsap.to('#overlappingDiv', {
          opacity: 1,
          repeat: 3,
          yoyo: true,
          duration: 0.4,
          onComplete() {
            gsap.to('#overlappingDiv', {
              opacity: 1,
              duration: 0.4,
              onComplete() {
                // activate a new animation loop
                initBattle()
                animateBattle()
                gsap.to('#overlappingDiv', {
                  opacity: 0,
                  duration: 0.4
                })
              }
            })
          }
        });
        break
      }
    }
  }

  if (keys.w.pressed && lastKey === 'w') {
    player.animate = true
    player.image = player.sprites.up

    checkForCharacterCollision({
      characters,
      player,
      characterOffset: { x: 0, y: currentSpeed }
    })

    // Check collision with characters to block movement
    for (let i = 0; i < characters.length; i++) {
      const character = characters[i]
      if (
        rectangularCollision({
          rectangle1: player,
          rectangle2: {
            ...character,
            position: {
              x: character.position.x,
              y: character.position.y + currentSpeed
            }
          }
        })
      ) {
        moving = false
        break
      }
    }

    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i]
      if (
        rectangularCollision({
          rectangle1: player,
          rectangle2: {
            ...boundary,
            position: {
              x: boundary.position.x,
              y: boundary.position.y + currentSpeed
            }
          }
        })
      ) {
        moving = false
        break
      }
    }

    if (moving)
      movables.forEach((movable) => {
        movable.position.y += currentSpeed
      })
  } else if (keys.a.pressed && lastKey === 'a') {
    player.animate = true
    player.image = player.sprites.left

    checkForCharacterCollision({
      characters,
      player,
      characterOffset: { x: currentSpeed, y: 0 }
    })

    // Check collision with characters to block movement
    for (let i = 0; i < characters.length; i++) {
      const character = characters[i]
      if (
        rectangularCollision({
          rectangle1: player,
          rectangle2: {
            ...character,
            position: {
              x: character.position.x + currentSpeed,
              y: character.position.y
            }
          }
        })
      ) {
        moving = false
        break
      }
    }

    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i]
      if (
        rectangularCollision({
          rectangle1: player,
          rectangle2: {
            ...boundary,
            position: {
              x: boundary.position.x + currentSpeed,
              y: boundary.position.y
            }
          }
        })
      ) {
        moving = false
        break
      }
    }

    if (moving)
      movables.forEach((movable) => {
        movable.position.x += currentSpeed
      })
  } else if (keys.s.pressed && lastKey === 's') {
    player.animate = true
    player.image = player.sprites.down

    checkForCharacterCollision({
      characters,
      player,
      characterOffset: { x: 0, y: -currentSpeed }
    })

    // Check collision with characters to block movement
    for (let i = 0; i < characters.length; i++) {
      const character = characters[i]
      if (
        rectangularCollision({
          rectangle1: player,
          rectangle2: {
            ...character,
            position: {
              x: character.position.x,
              y: character.position.y - currentSpeed
            }
          }
        })
      ) {
        moving = false
        break
      }
    }

    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i]
      if (
        rectangularCollision({
          rectangle1: player,
          rectangle2: {
            ...boundary,
            position: {
              x: boundary.position.x,
              y: boundary.position.y - currentSpeed
            }
          }
        })
      ) {
        moving = false
        break
      }
    }

    if (moving)
      movables.forEach((movable) => {
        movable.position.y -= currentSpeed
      })
  } else if (keys.d.pressed && lastKey === 'd') {
    player.animate = true
    player.image = player.sprites.right

    checkForCharacterCollision({
      characters,
      player,
      characterOffset: { x: -currentSpeed, y: 0 }
    })

    // Check collision with characters to block movement
    for (let i = 0; i < characters.length; i++) {
      const character = characters[i]
      if (
        rectangularCollision({
          rectangle1: player,
          rectangle2: {
            ...character,
            position: {
              x: character.position.x - currentSpeed,
              y: character.position.y
            }
          }
        })
      ) {
        moving = false
        break
      }
    }

    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i]
      if (
        rectangularCollision({
          rectangle1: player,
          rectangle2: {
            ...boundary,
            position: {
              x: boundary.position.x - currentSpeed,
              y: boundary.position.y
            }
          }
        })
      ) {
        moving = false
        break
      }
    }

    if (moving)
      movables.forEach((movable) => {
        movable.position.x -= currentSpeed
      })
  }
}

// Démarrer l'animation quand le canvas est prêt
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (canvas) {
      animate()
      checkProximityAndLaunchBattle()
    }
  })
} else {
  if (canvas) {
    animate()
    checkProximityAndLaunchBattle()
  }
}

let lastKey = ''
window.addEventListener('keydown', (e) => {
  // Gérer la navigation dans les choix
  if (isShowingChoices) {
    switch (e.key) {
      case 'w':
      case 'z': // AZERTY support
      case 'ArrowUp':
        currentChoiceIndex = Math.max(0, currentChoiceIndex - 1);
        updateChoiceSelection();
        return;
      case 's':
      case 'ArrowDown':
        currentChoiceIndex = Math.min(1, currentChoiceIndex + 1);
        updateChoiceSelection();
        return;
      case ' ':
        const selectedChoice = currentChoiceIndex === 0 ? 'yes' : 'no';
        hideDialogueChoices();
        if (choiceCallback) {
          choiceCallback(selectedChoice);
        }
        return;
    }
    return;
  }

  if (player.isInteracting) {
    switch (e.key) {
      case ' ':
        player.interactionAsset.dialogueIndex++;
        const { dialogueIndex, dialogue } = player.interactionAsset;
        if (dialogueIndex <= dialogue.length - 1) {
          document.querySelector('#characterDialogueBox').innerHTML =
            player.interactionAsset.dialogue[dialogueIndex];
          return;
        }

        // Vérifier si on est en attente d'un rematch après une défaite
        if (typeof window.waitingForRematch !== 'undefined' && window.waitingForRematch) {
          window.waitingForRematch = false;

          // Afficher les choix Oui/Non
          showDialogueChoices((choice) => {
            if (choice === 'yes') {
              // Oui → Relancer le combat
              player.isInteracting = false;
              player.interactionAsset.dialogueIndex = 0;
              document.querySelector('#characterDialogueBox').style.display = 'none';
              setTimeout(() => {
                launchBattle();
              }, 500);
            } else {
              // Non → Quitter le dialogue
              player.isInteracting = false;
              player.interactionAsset.dialogueIndex = 0;
              document.querySelector('#characterDialogueBox').style.display = 'none';
            }
          });
          return;
        }

        // Vérifier si on est en attente du combat initial (et qu'on n'a pas encore vaincu Dragkatchu)
        if (gameState.waitingForBattle && !window.hasDefeatedDragkatchu) {
          gameState.waitingForBattle = false;
          player.isInteracting = false;
          player.interactionAsset.dialogueIndex = 0;
          document.querySelector('#characterDialogueBox').style.display = 'none';

          // Lancer le combat
          setTimeout(() => {
            launchBattle();
          }, 500);
          return;
        }

        // Sinon, juste fermer le dialogue
        gameState.waitingForBattle = false;
        player.isInteracting = false;

        // Call onInteractionComplete if it exists
        if (player.interactionAsset && typeof player.interactionAsset.onInteractionComplete === 'function') {
          console.log('📞 Calling onInteractionComplete...');
          player.interactionAsset.onInteractionComplete();
        } else {
          console.log('ℹ️ No onInteractionComplete function found for this character');
        }

        player.interactionAsset.dialogueIndex = 0;
        document.querySelector('#characterDialogueBox').style.display = 'none';
        break;
    }
    return;
  }

  switch (e.key) {
    case ' ':
      if (!player.interactionAsset) return;

      // Si le joueur a déjà vaincu Dragkatchu et interagit avec newCharacter, ne pas lancer le combat
      if (player.interactionAsset === window.newCharacter && window.hasDefeatedDragkatchu) {
        gameState.waitingForBattle = false; // Ne pas attendre le combat
      }

      const firstMessage = player.interactionAsset.dialogue[0];
      document.querySelector('#characterDialogueBox').innerHTML = firstMessage;
      document.querySelector('#characterDialogueBox').style.display = 'flex';
      player.isInteracting = true;
      break;
    case 'w':
    case 'z': // AZERTY support
    case 'ArrowUp':
      keys.w.pressed = true;
      lastKey = 'w';
      break;
    case 'a':
    case 'q': // AZERTY support
    case 'ArrowLeft':
      keys.a.pressed = true;
      lastKey = 'a';
      break;
    case 's':
    case 'ArrowDown':
      keys.s.pressed = true;
      lastKey = 's';
      break;
    case 'd':
    case 'ArrowRight':
      keys.d.pressed = true;
      lastKey = 'd';
      break;
    case 'b':
    case 'Shift':
      keys.b.pressed = true;
      currentSpeed = sprintSpeed;
      break;
  }
});

window.addEventListener('keyup', (e) => {
  switch (e.key) {
    case 'w':
    case 'z': // AZERTY support
    case 'ArrowUp':
      keys.w.pressed = false;
      break;
    case 'a':
    case 'q': // AZERTY support
    case 'ArrowLeft':
      keys.a.pressed = false;
      break;
    case 's':
    case 'ArrowDown':
      keys.s.pressed = false;
      break;
    case 'd':
    case 'ArrowRight':
      keys.d.pressed = false;
      break;
    case 'b':
    case 'Shift':
      keys.b.pressed = false;
      currentSpeed = normalSpeed;
      break;
  }
});

let clicked = false;
addEventListener('click', () => {
  if (!clicked) {
    if (typeof audio !== 'undefined' && audio && audio.Map) {
      audio.Map.play();
    }
    clicked = true;
  }
});

function startKeyPress(key) {
  simulateKeyPress(key);
}

function stopKeyPress(key) {
  simulateKeyRelease(key);
}

function simulateKeyPress(key) {
  window.dispatchEvent(new KeyboardEvent('keydown', { 'key': key }));
}

function simulateKeyRelease(key) {
  window.dispatchEvent(new KeyboardEvent('keyup', { 'key': key }));
}

// Attacher les event listeners pour les contrôles mobiles
function attachMobileControls() {
  const leftBtn = document.querySelector('.dpad .left');
  const rightBtn = document.querySelector('.dpad .right');
  const upBtn = document.querySelector('.dpad .up');
  const downBtn = document.querySelector('.dpad .down');
  const aBtn = document.querySelector('.a-b .a');
  const bBtn = document.querySelector('.a-b .b');

  if (leftBtn) {
    leftBtn.addEventListener('mousedown', function () {
      startKeyPress('a');
    });
    leftBtn.addEventListener('mouseup', function () {
      stopKeyPress('a');
    });
    leftBtn.addEventListener('touchstart', function (e) {
      e.preventDefault();
      startKeyPress('a');
    });
    leftBtn.addEventListener('touchend', function () {
      stopKeyPress('a');
    });
  }

  if (rightBtn) {
    rightBtn.addEventListener('mousedown', function () {
      startKeyPress('d');
    });
    rightBtn.addEventListener('mouseup', function () {
      stopKeyPress('d');
    });
    rightBtn.addEventListener('touchstart', function (e) {
      e.preventDefault();
      startKeyPress('d');
    });
    rightBtn.addEventListener('touchend', function () {
      stopKeyPress('d');
    });
  }

  if (upBtn) {
    upBtn.addEventListener('mousedown', function () {
      startKeyPress('w');
    });
    upBtn.addEventListener('mouseup', function () {
      stopKeyPress('w');
    });
    upBtn.addEventListener('touchstart', function (e) {
      e.preventDefault();
      startKeyPress('w');
    });
    upBtn.addEventListener('touchend', function () {
      stopKeyPress('w');
    });
  }

  if (downBtn) {
    downBtn.addEventListener('mousedown', function () {
      startKeyPress('s');
    });
    downBtn.addEventListener('mouseup', function () {
      stopKeyPress('s');
    });
    downBtn.addEventListener('touchstart', function (e) {
      e.preventDefault();
      startKeyPress('s');
    });
    downBtn.addEventListener('touchend', function () {
      stopKeyPress('s');
    });
  }

  if (aBtn) {
    aBtn.addEventListener('mousedown', function () {
      simulateKeyPress(' ');
    });
    aBtn.addEventListener('mouseup', function () {
      simulateKeyRelease(' ');
    });
    aBtn.addEventListener('touchstart', function (e) {
      e.preventDefault();
      simulateKeyPress(' ');
    });
    aBtn.addEventListener('touchend', function () {
      simulateKeyRelease(' ');
    });
  }

  if (bBtn) {
    bBtn.addEventListener('mousedown', function () {
      simulateKeyPress('b');
    });
    bBtn.addEventListener('mouseup', function () {
      simulateKeyRelease('b');
    });
    bBtn.addEventListener('touchstart', function (e) {
      e.preventDefault();
      simulateKeyPress('b');
    });
    bBtn.addEventListener('touchend', function () {
      simulateKeyRelease('b');
    });
  }
}

// Attacher les contrôles quand le DOM est prêt
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', attachMobileControls);
} else {
  attachMobileControls();
}

let keyIntervals = {};
function startKeyPress(key) {
  console.log("startKeyPress called for key:", key);
  if (keyIntervals[key]) {
    console.log("Interval already running for key:", key);
    return; // Ne démarre pas un nouvel intervalle si un est déjà actif pour cette touche
  }
  keyIntervals[key] = setInterval(() => {
    const keydownEvent = new KeyboardEvent("keydown", { key: key });
    console.log("Firing keydown for key:", key);
    window.dispatchEvent(keydownEvent);
  }, 100); // Simule une pression de touche toutes les 100 ms
}

function stopKeyPress(key) {
  console.log("stopKeyPress called for key:", key);
  if (!keyIntervals[key]) {
    console.log("No interval to clear for key:", key);
    return; // Ne rien faire si aucun intervalle n'est actif
  }
  clearInterval(keyIntervals[key]); // Arrête l'intervalle actif
  keyIntervals[key] = null;

  const keyupEvent = new KeyboardEvent("keyup", { key: key });
  console.log("Firing keyup for key:", key);
  window.dispatchEvent(keyupEvent);
}


