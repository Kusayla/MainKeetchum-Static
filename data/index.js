

const canvas = document.querySelector('#mainCanvas') || document.querySelector('canvas')
if (!canvas) {
  console.error('Canvas not found! Make sure #mainCanvas exists in the DOM.');
  throw new Error('Canvas element not found');
}

const c = canvas.getContext('2d')

canvas.width = 1024
canvas.height = 576

const normalSpeed = 3;
const sprintSpeed = 6;

let currentSpeed = normalSpeed; // Vitesse actuelle

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
    "So you think you can handle Dragkatchu?",
    "Let's see if you're worthy of the password...",
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
  "I found something... an ancient note.",
  "It's written in Unown alphabet!",
  "It's now in your BAG.",
  "Press I to check your bag and decipher it.",
  "Study the symbols carefully...",
  "Good luck Degen!"
];

newCharacter.dialogueAfterDefeat = [
  "You lost against Dragkatchu!",
  "Want to try again? (Press SPACE to rematch)"
];

// Rendre newCharacter globalement accessible
window.newCharacter = newCharacter;

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
          dialogue: ['...', 'Y a que les arabes pour faire des scams?', 'les Israelien sont une sous race']
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
          dialogue: ['En vraie rien ne vos un bon scam.']
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
          player.isInteracting = false;
          player.interactionAsset.dialogueIndex = 0;
          document.querySelector('#characterDialogueBox').style.display = 'none';

          // Relancer le combat
          setTimeout(() => {
            launchBattle();
          }, 500);
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
      keys.w.pressed = true;
      lastKey = 'w';
      break;
    case 'a':
      keys.a.pressed = true;
      lastKey = 'a';
      break;
    case 's':
      keys.s.pressed = true;
      lastKey = 's';
      break;
    case 'd':
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
      keys.w.pressed = false;
      break;
    case 'a':
      keys.a.pressed = false;
      break;
    case 's':
      keys.s.pressed = false;
      break;
    case 'd':
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


