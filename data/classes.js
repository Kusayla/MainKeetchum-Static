class Sprite {
  interactionAsset;
  constructor({
    position,
    velocity,
    image,
    frames = { max: 1, hold: 10 },
    sprites,
    animate = false,
    rotation = 0,
    scale = 1
  }) {
    this.position = position
    this.image = new Image()
    this.frames = { ...frames, val: 0, elapsed: 0 }
    this.image.onload = () => {
      this.width = (this.image.width / this.frames.max) * scale
      this.height = this.image.height * scale
    }
    this.image.src = image.src

    this.animate = animate
    this.sprites = sprites
    this.opacity = 1

    this.rotation = rotation
    this.scale = scale
  }

  draw() {
    c.save()
    c.translate(
      this.position.x + this.width / 2,
      this.position.y + this.height / 2
    )
    c.rotate(this.rotation)
    c.translate(
      -this.position.x - this.width / 2,
      -this.position.y - this.height / 2
    )
    c.globalAlpha = this.opacity

    const crop = {
      position: {
        x: this.frames.val * (this.width / this.scale),
        y: 0
      },
      width: this.image.width / this.frames.max,
      height: this.image.height
    }

    const image = {
      position: {
        x: this.position.x,
        y: this.position.y
      },
      width: this.image.width / this.frames.max,
      height: this.image.height
    }

    c.drawImage(
      this.image,
      crop.position.x,
      crop.position.y,
      crop.width,
      crop.height,
      image.position.x,
      image.position.y,
      image.width * this.scale,
      image.height * this.scale
    )

    c.restore()

    if (!this.animate) return

    if (this.frames.max > 1) {
      this.frames.elapsed++
    }

    if (this.frames.elapsed % this.frames.hold === 0) {
      if (this.frames.val < this.frames.max - 1) this.frames.val++
      else this.frames.val = 0
    }
  }
}

class Monster extends Sprite {
  constructor({
    position,
    velocity,
    image,
    frames = { max: 1, hold: 10 },
    sprites,
    animate = false,
    rotation = 0,
    isEnemy = false,
    name,
    attacks,
    level = 5
  }) {
    super({
      position,
      velocity,
      image,
      frames,
      sprites,
      animate,
      rotation
    })
    this.level = level
    this.experience = 0
    this.experienceToNextLevel = this.level * 10
    this.maxHealth = 100 + (this.level - 5) * 10
    this.health = this.maxHealth
    this.isEnemy = isEnemy
    this.name = name
    this.originalName = name
    this.attacks = attacks
    this.originalAttacks = [...attacks]
    this.isTrumpy = false
    this.hasTransformed = false
    this.originalImage = image
    this.mexicoUsed = false // Flag pour le combo Mexico->Ice
  }

  gainExperience(amount, xpBarId, xpTextId, xpNeededId) {
    const initialXP = this.experience
    this.experience += amount

    // Animate XP bar filling
    if (xpBarId && xpTextId && xpNeededId) {
      const xpBar = document.querySelector(xpBarId)
      const xpText = document.querySelector(xpTextId)
      const xpNeeded = document.querySelector(xpNeededId)

      if (xpBar && xpText && xpNeeded) {
        const xpPercentage = (this.experience / this.experienceToNextLevel) * 100
        gsap.to(xpBar, {
          width: Math.min(xpPercentage, 100) + '%',
          duration: 1
        })
        xpText.textContent = this.experience
        xpNeeded.textContent = this.experienceToNextLevel
      }
    }

    // Check if leveled up
    const levelsGained = []
    while (this.experience >= this.experienceToNextLevel) {
      this.experience -= this.experienceToNextLevel
      const levelInfo = this.levelUp()
      levelsGained.push(levelInfo)

      // Update XP bar for new level
      if (xpBarId && xpTextId && xpNeededId) {
        const xpText = document.querySelector(xpTextId)
        const xpNeeded = document.querySelector(xpNeededId)
        if (xpText && xpNeeded) {
          xpText.textContent = this.experience
          xpNeeded.textContent = this.experienceToNextLevel
        }
      }
    }

    return {
      xpGained: amount,
      levelsGained: levelsGained,
      currentXP: this.experience,
      xpToNext: this.experienceToNextLevel
    }
  }

  levelUp() {
    const oldMaxHealth = this.maxHealth
    this.level++
    this.experienceToNextLevel = this.level * 10

    // Increase max health by 10 per level
    const healthIncrease = 10
    this.maxHealth += healthIncrease
    this.health = this.maxHealth

    // At level 10, replace Tackle with secret attack!
    if (this.level === 10 && !this.isEnemy && !this.isTrumpy) {
      const tackleIndex = this.attacks.findIndex(attack => attack.name === 'Tackle')
      const hasSecretAttack = this.attacks.some(attack => attack.name === '???')

      if (!hasSecretAttack && tackleIndex !== -1 && typeof attacks !== 'undefined' && attacks.SecretPower) {
        this.attacks[tackleIndex] = attacks.SecretPower
        console.log(`🔥 ${this.name} forgot Tackle and learned a mysterious new attack: ???`)
      }
    }

    console.log(`${this.name} leveled up to level ${this.level}! Max HP: ${oldMaxHealth} -> ${this.maxHealth}`)

    return {
      newLevel: this.level,
      healthIncrease: healthIncrease,
      newMaxHealth: this.maxHealth,
      learnedSecretAttack: this.level === 10 && !this.isEnemy
    }
  }

  updateXPDisplay(xpBarId, xpTextId, xpNeededId, levelId) {
    const xpBar = document.querySelector(xpBarId)
    const xpText = document.querySelector(xpTextId)
    const xpNeeded = document.querySelector(xpNeededId)
    const levelDisplay = document.querySelector(levelId)

    if (xpBar) {
      const xpPercentage = (this.experience / this.experienceToNextLevel) * 100
      xpBar.style.width = xpPercentage + '%'
    }
    if (xpText) xpText.textContent = this.experience
    if (xpNeeded) xpNeeded.textContent = this.experienceToNextLevel
    if (levelDisplay) levelDisplay.textContent = 'Lv' + this.level
  }

  transformIntoTrumpy(onComplete) {
    if (this.hasTransformed || this.isTrumpy) {
      return false
    }

    this.hasTransformed = true
    this.isTransforming = true // Flag pour empêcher la mort
    console.log('🔥💀 TRANSFORMATION TRIGGERED! TRUMPY MODE ACTIVATED! 💀🔥')

    // RESTORE HEALTH IMMEDIATELY to prevent death
    this.health = this.maxHealth

    // Update health bar immediately
    const healthBar = this.isEnemy ? '#enemyHealthBar' : '#playerHealthBar'
    const healthBarTrainer = this.isEnemy ? '#enemyHealthBarTrainer' : '#playerHealthBarTrainer'
    const bar = document.querySelector(healthBarTrainer) || document.querySelector(healthBar)
    if (bar) {
      gsap.to(bar, {
        width: '100%',
        duration: 0.5
      })
    }

    // Red screen flash animation
    const overlappingDiv = document.querySelector('#overlappingDiv')
    if (overlappingDiv) {
      overlappingDiv.style.background = 'red'
      gsap.to(overlappingDiv, {
        opacity: 1,
        duration: 0.3,
        repeat: 5,
        yoyo: true
      })
    }

    // Show transformation dialogue
    const dialogueBox = document.querySelector('#dialogueBoxTrainer') || document.querySelector('#dialogueBox')
    if (dialogueBox) {
      dialogueBox.innerHTML = '...'
      dialogueBox.style.display = 'block'
      setTimeout(() => {
        dialogueBox.innerHTML = 'What is this power...?'
        setTimeout(() => {
          dialogueBox.innerHTML = `${this.originalName} is transforming...!`
          setTimeout(() => {
            dialogueBox.innerHTML = 'TRUMPY MODE ACTIVATED!!!'
          }, 1000)
        }, 1000)
      }, 500)
    }

    // Transform after animation
    setTimeout(() => {
      this.isTrumpy = true
      this.name = 'TRUMPY'
      this.isTransforming = false // Transformation complete

      // REMPLACER LES ATTAQUES PAR MEXICO ET ICE
      if (typeof attacks !== 'undefined' && attacks.Mexico && attacks.Ice) {
        this.attacks = [attacks.Mexico, attacks.Ice]
        console.log('🔥 TRUMPY attacks: Mexico & Ice unlocked!')
      }

      // Update name display
      const nameDisplay = document.querySelector('#playerNameTrainer') || document.querySelector('#playerName')
      if (nameDisplay) {
        nameDisplay.textContent = 'TRUMPY'
      }

      // Load Trumpy sprite
      const trumpyImg = new Image()
      trumpyImg.src = './img/trumpy.png'
      trumpyImg.onload = () => {
        this.image = trumpyImg
      }

      // Reset red screen
      if (overlappingDiv) {
        overlappingDiv.style.background = 'black'
        gsap.to(overlappingDiv, {
          opacity: 0,
          duration: 0.5
        })
      }

      console.log('⚡ TRUMPY TRANSFORMATION COMPLETE! ⚡')
      console.log('💪 Use Mexico first, then Ice for instant kill!')

      // Re-render attack buttons
      const attacksBox = document.querySelector('#attacksBoxTrainer') || document.querySelector('#attacksBox')
      if (attacksBox) {
        attacksBox.replaceChildren()
        this.attacks.forEach((attack) => {
          const button = document.createElement('button')
          button.innerHTML = attack.name
          attacksBox.append(button)
        })
      }

      if (onComplete) onComplete()
    }, 4000)

    return true // Transformation initiated
  }

  faint() {
    // If player Pokemon and has secret attack but hasn't transformed yet, TRANSFORM!
    if (!this.isEnemy && !this.hasTransformed && this.level >= 10) {
      const hasSecretAttack = this.attacks.some(attack => attack.name === '???')
      if (hasSecretAttack) {
        this.transformIntoTrumpy()
        return true // Don't faint, transform instead! Return true to signal transformation
      }
    }

    // Normal faint
    const dialogueBox = document.querySelector('#dialogueBoxTrainer') || document.querySelector('#dialogueBox')
    if (dialogueBox) {
      dialogueBox.innerHTML = this.name + ' fainted!'
    }
    gsap.to(this.position, {
      y: this.position.y + 20
    })
    gsap.to(this, {
      opacity: 0
    })
    if (typeof audio !== 'undefined' && audio) {
      if (audio.battle) audio.battle.stop()
      if (audio.victory) audio.victory.play()
    }
    return false // Normal faint, no transformation
  }

  attack({ attack, recipient, renderedSprites, healthBarIds }) {
    // Déterminer les IDs des barres de vie et de la boîte de dialogue
    const dialogueBoxId = healthBarIds?.dialogueBox || '#dialogueBox'
    const enemyHealthBarId = healthBarIds?.enemy || '#enemyHealthBar'
    const playerHealthBarId = healthBarIds?.player || '#playerHealthBar'

    document.querySelector(dialogueBoxId).style.display = 'block'
    document.querySelector(dialogueBoxId).innerHTML =
      this.name + ' used ' + attack.name

    let healthBar = enemyHealthBarId
    if (this.isEnemy) healthBar = playerHealthBarId

    let rotation = 1
    if (this.isEnemy) rotation = -2.2

    // TRUMPY MODE: Gestion spéciale des attaques Mexico et Ice
    let actualDamage = attack.damage

    // Attaque MEXICO: Active le mode combo et renomme l'adversaire
    if (attack.name === 'Mexico') {
      this.mexicoUsed = true
      actualDamage = 0

      // Renommer l'adversaire en Pimmigrant
      recipient.name = 'Pimmigrant'

      // Mettre à jour l'affichage du nom
      const nameDisplay = recipient.isEnemy
        ? (document.querySelector('#enemyNameTrainer') || document.querySelector('#enemyName'))
        : (document.querySelector('#playerNameTrainer') || document.querySelector('#playerName'))

      if (nameDisplay) {
        nameDisplay.textContent = 'Pimmigrant'
      }

      console.log('🌮 MEXICO ACTIVATED! Ice is now deadly! 🌮')
      console.log('🌮 ' + recipient.originalName + ' is now Pimmigrant!')
    }
    // Attaque ICE: Comportement selon si Mexico a été utilisé
    else if (attack.name === 'Ice') {
      if (this.mexicoUsed) {
        // COMBO ACTIVÉ! Ice tue instantanément!
        actualDamage = recipient.maxHealth
        console.log('❄️💀 ICE COMBO! INSTANT KILL! 💀❄️')
      } else {
        // Pas de combo: Ice soigne l'adversaire
        actualDamage = -50 // Négatif = soigne
        console.log('❄️ Ice heals the enemy... Use Mexico first! ❄️')
      }
    }
    // Mode TRUMPY classique pour les autres attaques (ne devrait plus arriver)
    else if (this.isTrumpy) {
      actualDamage = recipient.maxHealth
      console.log('💥 TRUMPY ATTACK! ONE-HIT KO! 💥')
    }

    recipient.health -= actualDamage
    // Empêcher la santé de dépasser le max (si soigné)
    if (recipient.health > recipient.maxHealth) {
      recipient.health = recipient.maxHealth
    }

    switch (attack.name) {
      case 'Fireball':
        if (typeof audio !== 'undefined' && audio && audio.initFireball) {
          audio.initFireball.play()
        }
        const fireballImage = new Image()
        fireballImage.src = './img/fireball.png'
        const fireball = new Sprite({
          position: {
            x: this.position.x,
            y: this.position.y
          },
          image: fireballImage,
          frames: {
            max: 4,
            hold: 10
          },
          animate: true,
          rotation
        })
        renderedSprites.splice(1, 0, fireball)

        gsap.to(fireball.position, {
          x: recipient.position.x,
          y: recipient.position.y,
          onComplete: () => {
            // Enemy actually gets hit
            if (typeof audio !== 'undefined' && audio && audio.fireballHit) {
              audio.fireballHit.play()
            }
            gsap.to(healthBar, {
              width: (recipient.health / recipient.maxHealth * 100) + '%'
            })

            gsap.to(recipient.position, {
              x: recipient.position.x + 10,
              yoyo: true,
              repeat: 5,
              duration: 0.08
            })

            gsap.to(recipient, {
              opacity: 0,
              repeat: 5,
              yoyo: true,
              duration: 0.08
            })
            renderedSprites.splice(1, 1)
          }
        })

        break
      case 'Tackle':
        const tl = gsap.timeline()

        let movementDistance = 20
        if (this.isEnemy) movementDistance = -20

        tl.to(this.position, {
          x: this.position.x - movementDistance
        })
          .to(this.position, {
            x: this.position.x + movementDistance * 2,
            duration: 0.1,
            onComplete: () => {
              // Enemy actually gets hit
              if (typeof audio !== 'undefined' && audio && audio.tackleHit) {
                audio.tackleHit.play()
              }
              gsap.to(healthBar, {
                width: (recipient.health / recipient.maxHealth * 100) + '%'
              })

              gsap.to(recipient.position, {
                x: recipient.position.x + 10,
                yoyo: true,
                repeat: 5,
                duration: 0.08
              })

              gsap.to(recipient, {
                opacity: 0,
                repeat: 5,
                yoyo: true,
                duration: 0.08
              })
            }
          })
          .to(this.position, {
            x: this.position.x
          })
        break

      case 'Mexico':
        if (typeof audio !== 'undefined' && audio && audio.initMexico) {
          audio.initMexico.play()
        }
        const mexicoImage = new Image()
        mexicoImage.src = './img/mexico.png'
        const mexico = new Sprite({
          position: {
            x: this.position.x,
            y: this.position.y
          },
          image: mexicoImage,
          frames: {
            max: 4,
            hold: 10
          },
          animate: true,
          rotation
        })
        renderedSprites.splice(1, 0, mexico)

        gsap.to(mexico.position, {
          x: recipient.position.x,
          y: recipient.position.y,
          onComplete: () => {
            // Son quand Mexico touche
            if (typeof audio !== 'undefined' && audio && audio.mexicoHit) {
              audio.mexicoHit.play()
            }
            gsap.to(healthBar, {
              width: (recipient.health / recipient.maxHealth * 100) + '%'
            })

            gsap.to(recipient.position, {
              x: recipient.position.x + 10,
              yoyo: true,
              repeat: 5,
              duration: 0.08
            })

            gsap.to(recipient, {
              opacity: 0,
              repeat: 5,
              yoyo: true,
              duration: 0.08
            })
            renderedSprites.splice(1, 1)
          }
        })
        break

      case 'Ice':
        if (typeof audio !== 'undefined' && audio && audio.initIce) {
          audio.initIce.play()
        }
        const iceImage = new Image()
        iceImage.src = './img/ice.png'
        const ice = new Sprite({
          position: {
            x: this.position.x,
            y: this.position.y
          },
          image: iceImage,
          frames: {
            max: 4,
            hold: 60  // Animation très lente pour Ice
          },
          animate: true,
          rotation
        })
        renderedSprites.splice(1, 0, ice)

        gsap.to(ice.position, {
          x: recipient.position.x,
          y: recipient.position.y,
          onComplete: () => {
            // Son quand Ice touche
            if (typeof audio !== 'undefined' && audio && audio.iceHit) {
              audio.iceHit.play()
            }
            gsap.to(healthBar, {
              width: (recipient.health / recipient.maxHealth * 100) + '%'
            })

            gsap.to(recipient.position, {
              x: recipient.position.x + 10,
              yoyo: true,
              repeat: 5,
              duration: 0.08
            })

            gsap.to(recipient, {
              opacity: 0,
              repeat: 5,
              yoyo: true,
              duration: 0.08
            })
            renderedSprites.splice(1, 1)
          }
        })
        break
    }
  }
}

class Boundary {
  static width = 60
  static height = 60
  constructor({ position }) {
    this.position = position
    this.width = 60
    this.height = 60
  }

  draw() {
    c.fillStyle = 'rgba(255, 0, 0, 0)'
    c.fillRect(this.position.x, this.position.y, this.width, this.height)
  }
}

class Character extends Sprite {
  constructor({
    position,
    velocity,
    image,
    frames = { max: 1, hold: 10 },
    sprites,
    animate = false,
    rotation = 0,
    scale = 1,
    dialogue = [''],
    onInteractionComplete
  }) {
    super({
      position,
      velocity,
      image,
      frames,
      sprites,
      animate,
      rotation,
      scale
    })

    this.dialogue = dialogue
    this.dialogueIndex = 0
    this.onInteractionComplete = onInteractionComplete
  }
}
