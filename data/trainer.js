



const battleTrainerBackgroundImage = new Image();
battleTrainerBackgroundImage.src = './img/battleBackground.png';
const battleTrainerBackground = new Sprite({
  position: {
    x: 0,
    y: 0
  },
  image: battleTrainerBackgroundImage
});

let dragkatchu;
let embyTrainer;
let renderedSpritesTrainer;
let battleTrainerAnimationId;
let queueTrainer;
let selectedTrainerAttackIndex = 0;

function initBattl() {
  document.querySelector('#userInterfaceTrainer').style.display = 'block';
  document.querySelector('#dialogueBoxTrainer').style.display = 'none';
  document.querySelector('#enemyHealthBarTrainer').style.width = '100%';
  document.querySelector('#playerHealthBarTrainer').style.width = '100%';
  document.querySelector('#attacksBoxTrainer').replaceChildren();

  // Load player's saved level
  const savedLevel = localStorage.getItem('playerLevel');
  const playerLevel = savedLevel ? parseInt(savedLevel) : 5;

  dragkatchu = new Monster(monsters.dragkatchu);
  embyTrainer = new Monster({...monsters.Emby, level: playerLevel});
  renderedSpritesTrainer = [dragkatchu, embyTrainer];
  queueTrainer = [];

  // Update level displays
  document.querySelector('#enemyLevelTrainer').textContent = 'Lv' + dragkatchu.level;
  document.querySelector('#playerLevelTrainer').textContent = 'Lv' + embyTrainer.level;
  document.querySelector('#enemyNameTrainer').textContent = dragkatchu.name;
  document.querySelector('#playerNameTrainer').textContent = embyTrainer.name;

  embyTrainer.attacks.forEach((attack, index) => {
    const button = document.createElement('button');
    button.innerHTML = attack.name;
    if (index === selectedTrainerAttackIndex) {
      button.classList.add('selected');
    }
    document.querySelector('#attacksBoxTrainer').append(button);
  });

  document.querySelectorAll('#attacksBoxTrainer button').forEach((button, index) => {
    button.addEventListener('click', (e) => {
      const selectedTrainerAttack = attacks[e.currentTarget.innerHTML];
      trainerAttack(selectedTrainerAttack);
    });

    button.addEventListener('mouseenter', (e) => {
      const selectedTrainerAttack = attacks[e.currentTarget.innerHTML];
      document.querySelector('#attackTypeTrainer').innerHTML = selectedTrainerAttack.type;
      document.querySelector('#attackTypeTrainer').style.color = selectedTrainerAttack.color;
    });
  });
}

function playerTrainerAttack(selectedTrainerAttack) {
  embyTrainer.attack({
    attack: selectedTrainerAttack,
    recipient: dragkatchu,
    renderedSprites: renderedSpritesTrainer,
    healthBarIds: {
      dialogueBox: '#dialogueBoxTrainer',
      enemy: '#enemyHealthBarTrainer',
      player: '#playerHealthBarTrainer'
    }
  });

  if (dragkatchu.health <= 0) {
    queueTrainer.push(() => {
      dragkatchu.faint();
    });
    queueTrainer.push(() => {
      // fade back to black
      gsap.to('#overlappingDiv', {
        opacity: 1,
        onComplete: () => {
          if (battleTrainerAnimationId) {
            cancelAnimationFrame(battleTrainerAnimationId);
          }
          animate();
          document.querySelector('#userInterfaceTrainer').style.display = 'none';

          gsap.to('#overlappingDiv', {
            opacity: 0
          });

          battle.initiated = false;
          if (typeof audio !== 'undefined' && audio && audio.Map) audio.Map.play();
        }
      });
    });
  } else {
    // dragkatchu attacks
    const randomTrainerAttack = dragkatchu.attacks[Math.floor(Math.random() * dragkatchu.attacks.length)];
    queueTrainer.push(() => {
      dragkatchu.attack({
        attack: randomTrainerAttack,
        recipient: embyTrainer,
        renderedSprites: renderedSpritesTrainer,
        healthBarIds: {
          dialogueBox: '#dialogueBoxTrainer',
          enemy: '#enemyHealthBarTrainer',
          player: '#playerHealthBarTrainer'
        }
      });

      if (embyTrainer.health <= 0) {
        queueTrainer.push(() => {
          embyTrainer.faint();
        });

        queueTrainer.push(() => {
          // fade back to black
          gsap.to('#overlappingDiv', {
            opacity: 1,
            onComplete: () => {
              cancelAnimationFrame(battleTrainerAnimationId);
              animate();
              document.querySelector('#userInterfaceTrainer').style.display = 'none';

              gsap.to('#overlappingDiv', {
                opacity: 0
              });

              battle.initiated = false;
              if (typeof audio !== 'undefined' && audio && audio.Map) {
                audio.Map.play();
              }
            }
          });
        });
      }
    });
  }

  // Afficher la boîte de dialogue après l'attaque du joueur
  document.querySelector('#dialogueBoxTrainer').style.display = 'block';
}

function animateTrainerBattle() {
  battleTrainerAnimationId = window.requestAnimationFrame(animateTrainerBattle);
  if (battleTrainerBackground) {
    battleTrainerBackground.draw();
  }

  if (renderedSpritesTrainer) {
    renderedSpritesTrainer.forEach((sprite) => {
      sprite.draw();
    });
  }
}

// animate() - Retiré car appelé depuis index.js

document.querySelector('#dialogueBoxTrainer').addEventListener('click', (e) => {
  if (queueTrainer.length > 0) {
    queueTrainer[0]();
    queueTrainer.shift();
  } else {
    e.currentTarget.style.display = 'none';
  }
});

// Gestion des touches pour la sélection des attaques
window.addEventListener('keydown', (e) => {
  if (!battle.initiated) return;

  switch (e.key) {
    case 'a':
      selectTrainerPreviousAttack();
      break;
    case 'd':
      selectTrainerNextAttack();
      break;
    case ' ':
      if (document.querySelector('#dialogueBoxTrainer').style.display === 'block') {
        processTrainerQueue();
      } else {
        selectTrainerCurrentAttack();
      }
      break;
  }
});


function trainerAttack(selectedTrainerAttack) {
  embyTrainer.attack({
    attack: selectedTrainerAttack,
    recipient: dragkatchu,
    renderedSprites: renderedSpritesTrainer,
    healthBarIds: {
      dialogueBox: '#dialogueBoxTrainer',
      enemy: '#enemyHealthBarTrainer',
      player: '#playerHealthBarTrainer'
    }
  });

  if (dragkatchu.health <= 0) {
    queueTrainer.push(() => {
      dragkatchu.faint();
    });
    queueTrainer.push(() => {
      // Grant experience to player
      const experienceGained = dragkatchu.level * 5;
      const oldLevel = embyTrainer.level;
      embyTrainer.gainExperience(experienceGained);

      // Save player level
      localStorage.setItem('playerLevel', embyTrainer.level.toString());

      // If leveled up, show level up message first
      if (embyTrainer.level > oldLevel) {
        queueTrainer.push(() => {
          document.querySelector('#dialogueBoxTrainer').innerHTML = embyTrainer.name + ' gained ' + experienceGained + ' XP!';
          document.querySelector('#dialogueBoxTrainer').style.display = 'block';
        });
      }
    });
    queueTrainer.push(() => {
      // Victoire du joueur
      gsap.to('#overlappingDiv', {
        opacity: 1,
        onComplete: () => {
          if (battleTrainerAnimationId) {
            cancelAnimationFrame(battleTrainerAnimationId);
          }
          animate();
          document.querySelector('#userInterfaceTrainer').style.display = 'none';

          gsap.to('#overlappingDiv', {
            opacity: 0
          });

          battle.initiated = false;
          if (typeof audio !== 'undefined' && audio && audio.Map) audio.Map.play();

          // Afficher le dialogue de victoire avec le newCharacter
          if (typeof window.showVictoryDialogueGlobal === 'function') {
            window.showVictoryDialogueGlobal();
          }
        }
      });
    });
  } else {
    // dragkatchu attacks
    const randomTrainerAttack = dragkatchu.attacks[Math.floor(Math.random() * dragkatchu.attacks.length)];
    queueTrainer.push(() => {
      dragkatchu.attack({
        attack: randomTrainerAttack,
        recipient: embyTrainer,
        renderedSprites: renderedSpritesTrainer,
        healthBarIds: {
          dialogueBox: '#dialogueBoxTrainer',
          enemy: '#enemyHealthBarTrainer',
          player: '#playerHealthBarTrainer'
        }
      });

      if (embyTrainer.health <= 0) {
        queueTrainer.push(() => {
          embyTrainer.faint();
        });

        queueTrainer.push(() => {
          // Défaite du joueur
          gsap.to('#overlappingDiv', {
            opacity: 1,
            onComplete: () => {
              cancelAnimationFrame(battleTrainerAnimationId);
              animate();
              document.querySelector('#userInterfaceTrainer').style.display = 'none';

              gsap.to('#overlappingDiv', {
                opacity: 0
              });

              battle.initiated = false;
              if (typeof audio !== 'undefined' && audio && audio.Map) {
                audio.Map.play();
              }

              // Proposer de refaire le combat
              if (typeof window.showDefeatDialogueGlobal === 'function') {
                window.showDefeatDialogueGlobal();
              }
            }
          });
        });
      }
    });
  }

  // Afficher la boîte de dialogue après l'attaque du joueur
  document.querySelector('#dialogueBoxTrainer').style.display = 'block';
}

function selectTrainerPreviousAttack() {
  if (!embyTrainer || !embyTrainer.attacks) return;
  selectedTrainerAttackIndex = (selectedTrainerAttackIndex - 1 + embyTrainer.attacks.length) % embyTrainer.attacks.length;
  updateTrainerAttackSelection();
}

function selectTrainerNextAttack() {
  if (!embyTrainer || !embyTrainer.attacks) return;
  selectedTrainerAttackIndex = (selectedTrainerAttackIndex + 1) % embyTrainer.attacks.length;
  updateTrainerAttackSelection();
}

function selectTrainerCurrentAttack() {
  if (!embyTrainer || !embyTrainer.attacks) return;
  const selectedTrainerAttack = embyTrainer.attacks[selectedTrainerAttackIndex];
  trainerAttack(selectedTrainerAttack);
}

function updateTrainerAttackSelection() {
  const attackButtons = document.querySelectorAll('#attacksBoxTrainer button');
  attackButtons.forEach((button, index) => {
    if (index === selectedTrainerAttackIndex) {
      button.classList.add('selected');
    } else {
      button.classList.remove('selected');
    }
  });
}

function processTrainerQueue() {
  if (queueTrainer.length > 0) {
    queueTrainer[0]();
    queueTrainer.shift();
  } else {
    document.querySelector('#dialogueBoxTrainer').style.display = 'none';
  }
}

// checkProximityAndLaunchBattle() est appelé depuis index.js
// Les fonctions showVictoryDialogue et showDefeatDialogue sont maintenant dans index.js comme fonctions globales