const battleBackgroundImage = new Image()
battleBackgroundImage.src = './img/battleBackground.png'
const battleBackground = new Sprite({
  position: {
    x: 0,
    y: 0
  },
  image: battleBackgroundImage
})

let draggle
let emby
let renderedSprites
let battleAnimationId
let queue
let selectedAttackIndex = 0
let isBattleAttacking = false
let canProcessQueue = true

function initBattle() {
  document.querySelector('#userInterface').style.display = 'block'
  document.querySelector('#dialogueBox').style.display = 'none'
  document.querySelector('#enemyHealthBar').style.width = '100%'
  document.querySelector('#playerHealthBar').style.width = '100%'
  document.querySelector('#attacksBox').replaceChildren()
  // Cacher la boîte de dialogue des personnages et les choix
  const characterDialogue = document.querySelector('#characterDialogueBox')
  if (characterDialogue) characterDialogue.style.display = 'none'
  const dialogueChoices = document.querySelector('#dialogueChoices')
  if (dialogueChoices) dialogueChoices.style.display = 'none'
  isBattleAttacking = false
  selectedAttackIndex = 0
  canProcessQueue = true

  // Load player's saved level and XP
  const savedLevel = localStorage.getItem('playerLevel')
  const savedXP = localStorage.getItem('playerXP')
  const playerLevel = savedLevel ? parseInt(savedLevel) : 5
  const playerXP = savedXP ? parseInt(savedXP) : 0

  draggle = new Monster(monsters.Draggle)
  emby = new Monster({ ...monsters.Emby, level: playerLevel })
  emby.experience = playerXP
  emby.experienceToNextLevel = emby.level * 10

  // If level >= 10, replace Tackle with secret attack
  if (emby.level >= 10) {
    const tackleIndex = emby.attacks.findIndex(attack => attack.name === 'Tackle')
    const hasSecretAttack = emby.attacks.some(attack => attack.name === '???')

    if (!hasSecretAttack && tackleIndex !== -1 && typeof attacks !== 'undefined' && attacks.SecretPower) {
      emby.attacks[tackleIndex] = attacks.SecretPower
    }
  }

  renderedSprites = [draggle, emby]
  queue = []

  // Update level and XP displays
  document.querySelector('#enemyLevel').textContent = 'Lv' + draggle.level
  document.querySelector('#playerLevel').textContent = 'Lv' + emby.level
  document.querySelector('#enemyName').textContent = draggle.name
  document.querySelector('#playerName').textContent = emby.name

  // Update XP display
  emby.updateXPDisplay('#playerXPBar', '#playerXP', '#playerXPNeeded', '#playerLevel')

  emby.attacks.forEach((attack, index) => {
    const button = document.createElement('button')
    button.innerHTML = attack.name
    if (index === selectedAttackIndex) {
      button.classList.add('selected')
    }
    document.querySelector('#attacksBox').append(button)
  })

  // Attacher les événements aux boutons d'attaque
  attachBattleAttackListeners()
}

// Fonction pour attacher les événements de clic aux boutons d'attaque
function attachBattleAttackListeners() {
  // our event listeners for our buttons (attack)
  document.querySelectorAll('#attacksBox button').forEach((button) => {
    button.addEventListener('click', (e) => {
      // Empêcher le spam d'attaques
      if (isBattleAttacking) return

      const selectedAttack = attacks[e.currentTarget.innerHTML]
      isBattleAttacking = true

      emby.attack({
        attack: selectedAttack,
        recipient: draggle,
        renderedSprites
      })

      if (draggle.health <= 0) {
        queue.push(() => {
          draggle.faint()
        })
        queue.push(() => {
          // Grant experience to player
          const experienceGained = draggle.level * 5
          document.querySelector('#dialogueBox').innerHTML = emby.name + ' gained ' + experienceGained + ' XP!'
          document.querySelector('#dialogueBox').style.display = 'block'
        })
        queue.push(() => {
          const experienceGained = draggle.level * 5
          const result = emby.gainExperience(experienceGained, '#playerXPBar', '#playerXP', '#playerXPNeeded')

          // Save player level and XP
          localStorage.setItem('playerLevel', emby.level.toString())
          localStorage.setItem('playerXP', emby.experience.toString())

          // If leveled up, show level up message
          if (result.levelsGained && result.levelsGained.length > 0) {
            result.levelsGained.forEach((levelInfo) => {
              queue.push(() => {
                let message = emby.name + ' leveled up to Lv' + levelInfo.newLevel + '!<br>' +
                  'Max HP increased by ' + levelInfo.healthIncrease + '!<br>' +
                  'New Max HP: ' + levelInfo.newMaxHealth

                // Special message for level 10!
                if (levelInfo.learnedSecretAttack) {
                  message += '<br><br>🔥 ' + emby.name + ' forgot Tackle and learned a mysterious attack: ???'
                }

                document.querySelector('#dialogueBox').innerHTML = message
                document.querySelector('#dialogueBox').style.display = 'block'

                // Update level display
                document.querySelector('#playerLevel').textContent = 'Lv' + emby.level

                // Re-render attack buttons if secret attack was learned
                if (levelInfo.learnedSecretAttack) {
                  document.querySelector('#attacksBox').replaceChildren()
                  emby.attacks.forEach((attack, index) => {
                    const button = document.createElement('button')
                    button.innerHTML = attack.name
                    if (index === selectedAttackIndex) {
                      button.classList.add('selected')
                    }
                    document.querySelector('#attacksBox').append(button)
                  })
                  // Réattacher les événements de clic aux nouveaux boutons
                  attachBattleAttackListeners()
                }
              })
            })
          }
        })
        queue.push(() => {
          // Afficher le code de victoire
          if (typeof showVictoryCode === 'function') {
            showVictoryCode()
          }
          // fade back to black
          gsap.to('#overlappingDiv', {
            opacity: 1,
            onComplete: () => {
              cancelAnimationFrame(battleAnimationId)
              animate()
              document.querySelector('#userInterface').style.display = 'none'

              gsap.to('#overlappingDiv', {
                opacity: 0
              })

              battle.initiated = false
              if (audio) {
                if (audio.pumpTrump) audio.pumpTrump.stop();
                if (audio.battle) audio.battle.stop();
                if (audio.Map) audio.Map.play();
              }
            }
          })
        })
      }

      // draggle or enemy attacks right here
      const randomAttack =
        draggle.attacks[Math.floor(Math.random() * draggle.attacks.length)]

      queue.push(() => {
        draggle.attack({
          attack: randomAttack,
          recipient: emby,
          renderedSprites
        })
      })

      queue.push(() => {
        if (emby.health <= 0) {
          queue.push(() => {
            const didTransform = emby.faint()

            // Si transformation en cours, ne pas traiter la défaite
            if (!didTransform && !emby.isTransforming && !emby.isTrumpy) {
              queue.push(() => {
                // fade back to black
                gsap.to('#overlappingDiv', {
                  opacity: 1,
                  onComplete: () => {
                    cancelAnimationFrame(battleAnimationId)
                    animate()
                    document.querySelector('#userInterface').style.display = 'none'

                    gsap.to('#overlappingDiv', {
                      opacity: 0
                    })

                    battle.initiated = false
                    if (typeof audio !== 'undefined' && audio) {
                      if (audio.pumpTrump) audio.pumpTrump.stop();
                      if (audio.battle) audio.battle.stop();
                      if (audio.Map) audio.Map.play();
                    }
                  }
                })
              })
            } else {
              // Transformation ! Continuer le combat
              console.log('💀 Transformation detected! Battle continues!')
            }
          })
        }

        // IMPORTANT: Réinitialiser le flag seulement APRÈS toutes les animations
        isBattleAttacking = false
      })
    })

    button.addEventListener('mouseenter', (e) => {
      const selectedAttack = attacks[e.currentTarget.innerHTML]
      document.querySelector('#attackType').innerHTML = selectedAttack.type
      document.querySelector('#attackType').style.color = selectedAttack.color
    })
  })
}

function animateBattle() {
  battleAnimationId = window.requestAnimationFrame(animateBattle)
  battleBackground.draw()

  console.log(battleAnimationId)

  renderedSprites.forEach((sprite) => {
    sprite.draw()
  })
}

// animate() - Retiré car appelé depuis index.js
// initBattle()
// animateBattle()

document.querySelector('#dialogueBox').addEventListener('click', (e) => {
  // Empêcher le spam de clics sur le dialogue
  if (!canProcessQueue) return

  if (queue && queue.length > 0) {
    canProcessQueue = false
    queue[0]()
    queue.shift()

    // Réactiver après un délai (temps pour les animations)
    setTimeout(() => {
      canProcessQueue = true
    }, 300) // 300ms = empêche le spam sans ralentir le jeu
  } else {
    e.currentTarget.style.display = 'none'
  }
})

// Gestion des touches clavier pour la sélection des attaques
window.addEventListener('keydown', (e) => {
  // Vérifier qu'on est bien dans un combat normal (pas trainer)
  const userInterface = document.querySelector('#userInterface')
  if (!userInterface || userInterface.style.display === 'none') return

  // Ne pas interférer avec les dialogues
  const dialogueBox = document.querySelector('#dialogueBox')
  if (dialogueBox && dialogueBox.style.display === 'block') {
    // Permettre Espace pour avancer le dialogue
    if (e.key === ' ') {
      // Empêcher le spam de la barre espace
      if (!canProcessQueue) return

      if (queue && queue.length > 0) {
        canProcessQueue = false
        queue[0]()
        queue.shift()

        // Réactiver après un délai (temps pour les animations)
        setTimeout(() => {
          canProcessQueue = true
        }, 300) // 300ms = empêche le spam sans ralentir le jeu
      } else {
        dialogueBox.style.display = 'none'
      }
    }
    return
  }

  switch (e.key) {
    case 'a':
    case 'q': // AZERTY support
    case 'ArrowLeft':
      selectPreviousAttack()
      break
    case 'd':
    case 'ArrowRight':
      selectNextAttack()
      break
    case ' ':
    case 'Enter':
      selectCurrentAttack()
      break
  }
})

function selectPreviousAttack() {
  if (!emby || !emby.attacks) return
  selectedAttackIndex = (selectedAttackIndex - 1 + emby.attacks.length) % emby.attacks.length
  updateAttackSelection()
}

function selectNextAttack() {
  if (!emby || !emby.attacks) return
  selectedAttackIndex = (selectedAttackIndex + 1) % emby.attacks.length
  updateAttackSelection()
}

function selectCurrentAttack() {
  if (!emby || !emby.attacks) return
  // Empêcher le spam d'attaques
  if (isBattleAttacking) return

  const selectedAttack = emby.attacks[selectedAttackIndex]
  isBattleAttacking = true

  // Simuler le clic sur le bouton d'attaque correspondant
  emby.attack({
    attack: selectedAttack,
    recipient: draggle,
    renderedSprites
  })

  if (draggle.health <= 0) {
    queue.push(() => {
      draggle.faint()
    })
    queue.push(() => {
      // Grant experience to player
      const experienceGained = draggle.level * 5
      document.querySelector('#dialogueBox').innerHTML = emby.name + ' gained ' + experienceGained + ' XP!'
      document.querySelector('#dialogueBox').style.display = 'block'
    })
    queue.push(() => {
      const experienceGained = draggle.level * 5
      const result = emby.gainExperience(experienceGained, '#playerXPBar', '#playerXP', '#playerXPNeeded')

      // Save player level and XP
      localStorage.setItem('playerLevel', emby.level.toString())
      localStorage.setItem('playerXP', emby.experience.toString())

      // If leveled up, show level up message
      if (result.levelsGained && result.levelsGained.length > 0) {
        result.levelsGained.forEach((levelInfo) => {
          queue.push(() => {
            let message = emby.name + ' leveled up to Lv' + levelInfo.newLevel + '!<br>' +
              'Max HP increased by ' + levelInfo.healthIncrease + '!<br>' +
              'New Max HP: ' + levelInfo.newMaxHealth

            // Special message for level 10!
            if (levelInfo.learnedSecretAttack) {
              message += '<br><br>🔥 ' + emby.name + ' forgot Tackle and learned a mysterious attack: ???'
            }

            document.querySelector('#dialogueBox').innerHTML = message
            document.querySelector('#dialogueBox').style.display = 'block'

            // Update level display
            document.querySelector('#playerLevel').textContent = 'Lv' + emby.level

            // Re-render attack buttons if secret attack was learned
            if (levelInfo.learnedSecretAttack) {
              document.querySelector('#attacksBox').replaceChildren()
              emby.attacks.forEach((attack, index) => {
                const button = document.createElement('button')
                button.innerHTML = attack.name
                if (index === selectedAttackIndex) {
                  button.classList.add('selected')
                }
                document.querySelector('#attacksBox').append(button)
              })
              // Réattacher les événements de clic aux nouveaux boutons
              attachBattleAttackListeners()
            }
          })
        })
      }
    })
    queue.push(() => {
      // Afficher le code de victoire
      if (typeof showVictoryCode === 'function') {
        showVictoryCode()
      }
      // fade back to black
      gsap.to('#overlappingDiv', {
        opacity: 1,
        onComplete: () => {
          cancelAnimationFrame(battleAnimationId)
          animate()
          document.querySelector('#userInterface').style.display = 'none'

          gsap.to('#overlappingDiv', {
            opacity: 0
          })

          battle.initiated = false
          if (audio) {
            if (audio.pumpTrump) audio.pumpTrump.stop();
            if (audio.battle) audio.battle.stop();
            if (audio.Map) audio.Map.play();
          }
        }
      })
    })
  }

  // draggle or enemy attacks right here
  const randomAttack =
    draggle.attacks[Math.floor(Math.random() * draggle.attacks.length)]

  queue.push(() => {
    draggle.attack({
      attack: randomAttack,
      recipient: emby,
      renderedSprites
    })
  })

  queue.push(() => {
    if (emby.health <= 0) {
      queue.push(() => {
        const didTransform = emby.faint()

        // Si transformation en cours, ne pas traiter la défaite
        if (!didTransform && !emby.isTransforming && !emby.isTrumpy) {
          queue.push(() => {
            // fade back to black
            gsap.to('#overlappingDiv', {
              opacity: 1,
              onComplete: () => {
                cancelAnimationFrame(battleAnimationId)
                animate()
                document.querySelector('#userInterface').style.display = 'none'

                gsap.to('#overlappingDiv', {
                  opacity: 0
                })

                battle.initiated = false
                if (typeof audio !== 'undefined' && audio) {
                  if (audio.pumpTrump) audio.pumpTrump.stop();
                  if (audio.battle) audio.battle.stop();
                  if (audio.Map) audio.Map.play();
                }
              }
            })
          })
        } else {
          // Transformation ! Continuer le combat
          console.log('💀 Transformation detected! Battle continues!')
        }
      })
    }

    // IMPORTANT: Réinitialiser le flag seulement APRÈS toutes les animations
    isBattleAttacking = false
  })
}

function updateAttackSelection() {
  const attackButtons = document.querySelectorAll('#attacksBox button')
  attackButtons.forEach((button, index) => {
    if (index === selectedAttackIndex) {
      button.classList.add('selected')
      // Mettre à jour l'affichage du type d'attaque
      const selectedAttack = attacks[button.innerHTML]
      if (selectedAttack) {
        document.querySelector('#attackType').innerHTML = selectedAttack.type
        document.querySelector('#attackType').style.color = selectedAttack.color
      }
    } else {
      button.classList.remove('selected')
    }
  })
}
