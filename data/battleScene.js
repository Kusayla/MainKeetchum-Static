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

function initBattle() {
  document.querySelector('#userInterface').style.display = 'block'
  document.querySelector('#dialogueBox').style.display = 'none'
  document.querySelector('#enemyHealthBar').style.width = '100%'
  document.querySelector('#playerHealthBar').style.width = '100%'
  document.querySelector('#attacksBox').replaceChildren()

  // Load player's saved level and XP
  const savedLevel = localStorage.getItem('playerLevel')
  const savedXP = localStorage.getItem('playerXP')
  const playerLevel = savedLevel ? parseInt(savedLevel) : 5
  const playerXP = savedXP ? parseInt(savedXP) : 0

  draggle = new Monster(monsters.Draggle)
  emby = new Monster({...monsters.Emby, level: playerLevel})
  emby.experience = playerXP
  emby.experienceToNextLevel = emby.level * 10

  // If level >= 10, add secret attack
  if (emby.level >= 10) {
    const hasSecretAttack = emby.attacks.some(attack => attack.name === '???')
    if (!hasSecretAttack && typeof attacks !== 'undefined' && attacks.SecretPower) {
      emby.attacks.push(attacks.SecretPower)
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

  emby.attacks.forEach((attack) => {
    const button = document.createElement('button')
    button.innerHTML = attack.name
    document.querySelector('#attacksBox').append(button)
  })

  // our event listeners for our buttons (attack)
  document.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', (e) => {
      const selectedAttack = attacks[e.currentTarget.innerHTML]
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
                  message += '<br><br>🔥 ' + emby.name + ' learned a mysterious attack: ???'
                }

                document.querySelector('#dialogueBox').innerHTML = message
                document.querySelector('#dialogueBox').style.display = 'block'

                // Update level display
                document.querySelector('#playerLevel').textContent = 'Lv' + emby.level

                // Re-render attack buttons if secret attack was learned
                if (levelInfo.learnedSecretAttack) {
                  document.querySelector('#attacksBox').replaceChildren()
                  emby.attacks.forEach((attack) => {
                    const button = document.createElement('button')
                    button.innerHTML = attack.name
                    document.querySelector('#attacksBox').append(button)
                  })
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
              if (audio && audio.Map) audio.Map.play()
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

        if (emby.health <= 0) {
          queue.push(() => {
            emby.faint()
          })

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
                if (typeof audio !== 'undefined' && audio && audio.Map) audio.Map.play()
              }
            })
          })
        }
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
  if (queue && queue.length > 0) {
    queue[0]()
    queue.shift()
  } else e.currentTarget.style.display = 'none'
})
