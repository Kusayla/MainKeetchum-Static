const battleBackgroundImage = new Image();
battleBackgroundImage.src = './img/battleBackground.png';
const battleBackground = new Sprite({
  position: {
    x: 0,
    y: 0
  },
  image: battleBackgroundImage
});

let playerMonster;
let enemyMonster;
let renderedSprites;
let battleAnimationId;
let queue;
let selectedAttackIndex = 0;

function initBattle(isTrainerBattle = false) {
  document.querySelector('#userInterface').style.display = 'block';
  document.querySelector('#dialogueBox').style.display = 'none';
  document.querySelector('#enemyHealthBar').style.width = '100%';
  document.querySelector('#playerHealthBar').style.width = '100%';
  document.querySelector('#attacksBox').replaceChildren();

  if (isTrainerBattle) {
    playerMonster = new Monster(monsters.Emby);
    enemyMonster = new Monster(monsters.dragkatchu);
  } else {
    playerMonster = new Monster(monsters.Emby);
    enemyMonster = new Monster(monsters.Draggle);
  }

  renderedSprites = [enemyMonster, playerMonster];
  queue = [];

  playerMonster.attacks.forEach((attack, index) => {
    const button = document.createElement('button');
    button.innerHTML = attack.name;
    if (index === selectedAttackIndex) {
      button.classList.add('selected');
    }
    document.querySelector('#attacksBox').append(button);
  });

  document.querySelectorAll('button').forEach((button, index) => {
    button.addEventListener('click', (e) => {
      const selectedAttack = attacks[e.currentTarget.innerHTML];
      playerAttack(selectedAttack);
    });

    button.addEventListener('mouseenter', (e) => {
      const selectedAttack = attacks[e.currentTarget.innerHTML];
      document.querySelector('#attackType').innerHTML = selectedAttack.type;
      document.querySelector('#attackType').style.color = selectedAttack.color;
    });
  });
}

function playerAttack(selectedAttack) {
  playerMonster.attack({
    attack: selectedAttack,
    recipient: enemyMonster,
    renderedSprites
  });

  if (enemyMonster.health <= 0) {
    queue.push(() => {
      enemyMonster.faint();
    });
    queue.push(() => {
      gsap.to('#overlappingDiv', {
        opacity: 1,
        onComplete: () => {
          endBattle();
          document.querySelector('#userInterface').style.display = 'none';
          gsap.to('#overlappingDiv', {
            opacity: 0
          });
          battle.initiated = false;
          audio.Map.play();
        }
      });
    });
  } else {
    const randomAttack = enemyMonster.attacks[Math.floor(Math.random() * enemyMonster.attacks.length)];
    queue.push(() => {
      enemyMonster.attack({
        attack: randomAttack,
        recipient: playerMonster,
        renderedSprites
      });

      if (playerMonster.health <= 0) {
        queue.push(() => {
          playerMonster.faint();
        });
        queue.push(() => {
          gsap.to('#overlappingDiv', {
            opacity: 1,
            onComplete: () => {
              endBattle();
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

  document.querySelector('#dialogueBox').style.display = 'block';
}

function animateBattle() {
  battleAnimationId = window.requestAnimationFrame(animateBattle);
  battleBackground.draw();

  renderedSprites.forEach((sprite) => {
    sprite.draw();
  });
}

function endBattle() {
  cancelAnimationFrame(battleAnimationId);
  animate();
}

document.querySelector('#dialogueBox').addEventListener('click', (e) => {
  if (queue.length > 0) {
    queue[0]();
    queue.shift();
  } else {
    e.currentTarget.style.display = 'none';
  }
});

window.addEventListener('keydown', (e) => {
  if (!battle.initiated) return;

  switch (e.key) {
    case 'a':
      selectPreviousAttack();
      break;
    case 'd':
      selectNextAttack();
      break;
    case ' ':
      if (document.querySelector('#dialogueBox').style.display === 'block') {
        processQueue();
      } else {
        selectCurrentAttack();
      }
      break;
  }
});

function selectPreviousAttack() {
  selectedAttackIndex = (selectedAttackIndex - 1 + playerMonster.attacks.length) % playerMonster.attacks.length;
  updateAttackSelection();
}

function selectNextAttack() {
  selectedAttackIndex = (selectedAttackIndex + 1) % playerMonster.attacks.length;
  updateAttackSelection();
}

function selectCurrentAttack() {
  const selectedAttack = playerMonster.attacks[selectedAttackIndex];
  playerAttack(selectedAttack);
}

function updateAttackSelection() {
  const attackButtons = document.querySelectorAll('#attacksBox button');
  attackButtons.forEach((button, index) => {
    if (index === selectedAttackIndex) {
      button.classList.add('selected');
    } else {
      button.classList.remove('selected');
    }
  });
}

function processQueue() {
  if (queue.length > 0) {
    queue[0]();
    queue.shift();
  } else {
    document.querySelector('#dialogueBox').style.display = 'none';
  }
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'b') {
    forceTrainerBattle();
  }
});

function forceTrainerBattle() {
  const animationId = window.requestAnimationFrame(animate);
  window.cancelAnimationFrame(animationId);

  audio.Map.stop();
  audio.initBattle.play();
  audio.battle.play();

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
          initBattle(true);
          animateBattle();
          gsap.to('#overlappingDiv', {
            opacity: 0,
            duration: 0.4
          });
        }
      });
    }
  });
}
checkProximityAndLaunchBattle();