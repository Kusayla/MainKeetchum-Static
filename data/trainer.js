



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
  document.querySelector('#userInterface').style.display = 'block';
  document.querySelector('#dialogueBox').style.display = 'none';
  document.querySelector('#enemyHealthBar').style.width = '100%';
  document.querySelector('#playerHealthBar').style.width = '100%';
  document.querySelector('#attacksBox').replaceChildren();

  dragkatchu = new Monster(monsters.dragkatchu);
  embyTrainer = new Monster(monsters.Emby);
  renderedSpritesTrainer = [dragkatchu, embyTrainer];
  queueTrainer = [];

  embyTrainer.attacks.forEach((attack, index) => {
    const button = document.createElement('button');
    button.innerHTML = attack.name;
    if (index === selectedTrainerAttackIndex) {
      button.classList.add('selected');
    }
    document.querySelector('#attacksBox').append(button);
  });

  document.querySelectorAll('button').forEach((button, index) => {
    button.addEventListener('click', (e) => {
      const selectedTrainerAttack = attacks[e.currentTarget.innerHTML];
      trainerAttack(selectedTrainerAttack);
    });

    button.addEventListener('mouseenter', (e) => {
      const selectedTrainerAttack = attacks[e.currentTarget.innerHTML];
      document.querySelector('#attackType').innerHTML = selectedTrainerAttack.type;
      document.querySelector('#attackType').style.color = selectedTrainerAttack.color;
    });
  });
}

function playerTrainerAttack(selectedTrainerAttack) {
  embyTrainer.attack({
    attack: selectedTrainerAttack,
    recipient: dragkatchu,
    renderedSprites: renderedSpritesTrainer
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
          cancelAnimationFrame(battleTrainerAnimationId);
          animate();
          document.querySelector('#userInterface').style.display = 'none';

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
        renderedSprites: renderedSpritesTrainer
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
              document.querySelector('#userInterface').style.display = 'none';

              gsap.to('#overlappingDiv', {
                opacity: 0
              });

              battle.initiated = false;
              audio.Map.play();
            }
          });
        });
      }
    });
  }

  // Afficher la boîte de dialogue après l'attaque du joueur
  document.querySelector('#dialogueBox').style.display = 'block';
}

function animateTrainerBattle() {
  battleTrainerAnimationId = window.requestAnimationFrame(animateTrainerBattle);
  battleTrainerBackground.draw();

  renderedSpritesTrainer.forEach((sprite) => {
    sprite.draw();
  });
}

// animate() - Retiré car appelé depuis index.js

document.querySelector('#dialogueBox').addEventListener('click', (e) => {
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
      if (document.querySelector('#dialogueBox').style.display === 'block') {
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
    renderedSprites: renderedSpritesTrainer
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
          cancelAnimationFrame(battleTrainerAnimationId);
          animate();
          document.querySelector('#userInterface').style.display = 'none';

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
        renderedSprites: renderedSpritesTrainer
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
              document.querySelector('#userInterface').style.display = 'none';

              gsap.to('#overlappingDiv', {
                opacity: 0
              });

              battle.initiated = false;
              audio.Map.play();
            }
          });
        });
      }
    });
  }

  // Afficher la boîte de dialogue après l'attaque du joueur
  document.querySelector('#dialogueBox').style.display = 'block';
}

function selectTrainerPreviousAttack() {
  selectedTrainerAttackIndex = (selectedTrainerAttackIndex - 1 + embyTrainer.attacks.length) % embyTrainer.attacks.length;
  updateTrainerAttackSelection();
}

function selectTrainerNextAttack() {
  selectedTrainerAttackIndex = (selectedTrainerAttackIndex + 1) % embyTrainer.attacks.length;
  updateTrainerAttackSelection();
}

function selectTrainerCurrentAttack() {
  const selectedTrainerAttack = embyTrainer.attacks[selectedTrainerAttackIndex];
  trainerAttack(selectedTrainerAttack);
}

function updateTrainerAttackSelection() {
  const attackButtons = document.querySelectorAll('#attacksBox button');
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
    document.querySelector('#dialogueBox').style.display = 'none';
  }
}

// checkProximityAndLaunchBattle() est appelé depuis index.js