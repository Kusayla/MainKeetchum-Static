



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
let isTrainerAttacking = false;
let canProcessQueueTrainer = true;

function initBattl() {
  document.querySelector('#userInterfaceTrainer').style.display = 'block';
  document.querySelector('#dialogueBoxTrainer').style.display = 'none';
  document.querySelector('#enemyHealthBarTrainer').style.width = '100%';
  document.querySelector('#playerHealthBarTrainer').style.width = '100%';
  document.querySelector('#attacksBoxTrainer').replaceChildren();
  // Cacher la boîte de dialogue des personnages et les choix
  const characterDialogue = document.querySelector('#characterDialogueBox');
  if (characterDialogue) characterDialogue.style.display = 'none';
  const dialogueChoices = document.querySelector('#dialogueChoices');
  if (dialogueChoices) dialogueChoices.style.display = 'none';
  isTrainerAttacking = false;
  selectedTrainerAttackIndex = 0;
  canProcessQueueTrainer = true;

  // Load player's saved level and XP
  const savedLevel = localStorage.getItem('playerLevel');
  const savedXP = localStorage.getItem('playerXP');
  const playerLevel = savedLevel ? parseInt(savedLevel) : 5;
  const playerXP = savedXP ? parseInt(savedXP) : 0;

  dragkatchu = new Monster(monsters.dragkatchu);
  embyTrainer = new Monster({ ...monsters.Emby, level: playerLevel });
  embyTrainer.experience = playerXP;
  embyTrainer.experienceToNextLevel = embyTrainer.level * 10;

  // If level >= 10, replace Tackle with secret attack
  if (embyTrainer.level >= 10) {
    const tackleIndex = embyTrainer.attacks.findIndex(attack => attack.name === 'Tackle');
    const hasSecretAttack = embyTrainer.attacks.some(attack => attack.name === '???');

    if (!hasSecretAttack && tackleIndex !== -1 && typeof attacks !== 'undefined' && attacks.SecretPower) {
      embyTrainer.attacks[tackleIndex] = attacks.SecretPower;
    }
  }

  renderedSpritesTrainer = [dragkatchu, embyTrainer];
  queueTrainer = [];

  // Update level and XP displays
  document.querySelector('#enemyLevelTrainer').textContent = 'Lv' + dragkatchu.level;
  document.querySelector('#playerLevelTrainer').textContent = 'Lv' + embyTrainer.level;
  document.querySelector('#enemyNameTrainer').textContent = dragkatchu.name;
  document.querySelector('#playerNameTrainer').textContent = embyTrainer.name;

  // Update XP display
  embyTrainer.updateXPDisplay('#playerXPBarTrainer', '#playerXPTrainer', '#playerXPNeededTrainer', '#playerLevelTrainer');

  embyTrainer.attacks.forEach((attack, index) => {
    const button = document.createElement('button');
    button.innerHTML = attack.name;
    if (index === selectedTrainerAttackIndex) {
      button.classList.add('selected');
    }
    document.querySelector('#attacksBoxTrainer').append(button);
  });

  // Attacher les événements aux boutons d'attaque
  attachTrainerAttackListeners();
}

// Fonction pour attacher les événements de clic aux boutons d'attaque du trainer
function attachTrainerAttackListeners() {
  document.querySelectorAll('#attacksBoxTrainer button').forEach((button, index) => {
    button.addEventListener('click', (e) => {
      // Empêcher le spam d'attaques
      if (isTrainerAttacking) return;

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
          if (typeof audio !== 'undefined' && audio) {
            if (audio.pumpTrump) audio.pumpTrump.stop();
            if (audio.battle) audio.battle.stop();
            if (audio.Map) audio.Map.play();
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
  // Empêcher le spam de clics sur le dialogue
  if (!canProcessQueueTrainer) return;

  if (queueTrainer.length > 0) {
    canProcessQueueTrainer = false;
    queueTrainer[0]();
    queueTrainer.shift();

    // Réactiver après un délai (temps pour les animations)
    setTimeout(() => {
      canProcessQueueTrainer = true;
    }, 300); // 300ms = empêche le spam sans ralentir le jeu
  } else {
    e.currentTarget.style.display = 'none';
  }
});

// Gestion des touches pour la sélection des attaques
window.addEventListener('keydown', (e) => {
  if (!battle.initiated) return;

  switch (e.key) {
    case 'a':
    case 'q': // AZERTY support
    case 'ArrowLeft':
      selectTrainerPreviousAttack();
      break;
    case 'd':
    case 'ArrowRight':
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
  // Empêcher le spam d'attaques
  if (isTrainerAttacking) return;
  isTrainerAttacking = true;

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
      // Show XP gained message
      const experienceGained = dragkatchu.level * 5;
      document.querySelector('#dialogueBoxTrainer').innerHTML = embyTrainer.name + ' gained ' + experienceGained + ' XP!';
      document.querySelector('#dialogueBoxTrainer').style.display = 'block';
    });
    queueTrainer.push(() => {
      // Grant experience to player
      const experienceGained = dragkatchu.level * 5;
      const result = embyTrainer.gainExperience(experienceGained, '#playerXPBarTrainer', '#playerXPTrainer', '#playerXPNeededTrainer');

      // Save player level and XP
      localStorage.setItem('playerLevel', embyTrainer.level.toString());
      localStorage.setItem('playerXP', embyTrainer.experience.toString());

      // If leveled up, show level up message
      if (result.levelsGained && result.levelsGained.length > 0) {
        result.levelsGained.forEach((levelInfo) => {
          queueTrainer.push(() => {
            let message = embyTrainer.name + ' leveled up to Lv' + levelInfo.newLevel + '!<br>' +
              'Max HP increased by ' + levelInfo.healthIncrease + '!<br>' +
              'New Max HP: ' + levelInfo.newMaxHealth;

            // Special message for level 10!
            if (levelInfo.learnedSecretAttack) {
              message += '<br><br>🔥 ' + embyTrainer.name + ' forgot Tackle and learned a mysterious attack: ???';
            }

            document.querySelector('#dialogueBoxTrainer').innerHTML = message;
            document.querySelector('#dialogueBoxTrainer').style.display = 'block';

            // Update level display
            document.querySelector('#playerLevelTrainer').textContent = 'Lv' + embyTrainer.level;

            // Re-render attack buttons if secret attack was learned
            if (levelInfo.learnedSecretAttack) {
              document.querySelector('#attacksBoxTrainer').replaceChildren();
              embyTrainer.attacks.forEach((attack, index) => {
                const button = document.createElement('button');
                button.innerHTML = attack.name;
                if (index === selectedTrainerAttackIndex) {
                  button.classList.add('selected');
                }
                document.querySelector('#attacksBoxTrainer').append(button);
              });
            }
          });
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
          if (typeof audio !== 'undefined' && audio) {
            if (audio.pumpTrump) audio.pumpTrump.stop();
            if (audio.battle) audio.battle.stop();
            if (audio.Map) audio.Map.play();
          }

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
    });

    queueTrainer.push(() => {
      if (embyTrainer.health <= 0) {
        queueTrainer.push(() => {
          const didTransform = embyTrainer.faint();

          // Si transformation en cours, ne pas traiter la défaite
          if (!didTransform && !embyTrainer.isTransforming && !embyTrainer.isTrumpy) {
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
          } else {
            // Transformation ! Continuer le combat
            console.log('💀 Transformation detected! Battle continues!');
          }
        });
      }

      // IMPORTANT: Réinitialiser le flag seulement APRÈS toutes les animations
      isTrainerAttacking = false;
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
  // Empêcher le spam d'attaques
  if (isTrainerAttacking) return;

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
  // Empêcher le spam de la barre espace
  if (!canProcessQueueTrainer) return;

  if (queueTrainer.length > 0) {
    canProcessQueueTrainer = false;
    queueTrainer[0]();
    queueTrainer.shift();

    // Réactiver après un délai (temps pour les animations)
    setTimeout(() => {
      canProcessQueueTrainer = true;
    }, 300); // 300ms = empêche le spam sans ralentir le jeu
  } else {
    document.querySelector('#dialogueBoxTrainer').style.display = 'none';
  }
}

// checkProximityAndLaunchBattle() est appelé depuis index.js
// Les fonctions showVictoryDialogue et showDefeatDialogue sont maintenant dans index.js comme fonctions globales