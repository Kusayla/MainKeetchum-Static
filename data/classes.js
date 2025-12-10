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
    this.attacks = attacks
  }

  gainExperience(amount) {
    this.experience += amount

    // Check if leveled up
    while (this.experience >= this.experienceToNextLevel) {
      this.experience -= this.experienceToNextLevel
      this.levelUp()
    }
  }

  levelUp() {
    this.level++
    this.experienceToNextLevel = this.level * 10

    // Increase max health by 10 per level
    const healthIncrease = 10
    this.maxHealth += healthIncrease
    this.health = this.maxHealth

    // Show level up notification
    const dialogueBox = document.querySelector('#dialogueBoxTrainer') || document.querySelector('#dialogueBox')
    if (dialogueBox) {
      dialogueBox.innerHTML = this.name + ' leveled up to level ' + this.level + '!'
      dialogueBox.style.display = 'block'
    }

    console.log(`${this.name} leveled up to level ${this.level}! Max HP is now ${this.maxHealth}`)
  }

  faint() {
    // Essayer d'abord le dialogue trainer, puis le dialogue normal
    const dialogueBox = document.querySelector('#dialogueBoxTrainer') || document.querySelector('#dialogueBox');
    if (dialogueBox) {
      dialogueBox.innerHTML = this.name + ' fainted!';
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

    recipient.health -= attack.damage

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
    dialogue = ['']
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
  }
}
