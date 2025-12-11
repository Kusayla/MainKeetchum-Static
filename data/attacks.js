const attacks = {
  Tackle: {
    name: 'Tackle',
    damage: 10,
    type: 'Normal',
    color: 'black'
  },
  Fireball: {
    name: 'Fireball',
    damage: 25,
    type: 'Fire',
    color: 'red'
  },
  SecretPower: {
    name: '???',
    damage: 0,
    type: '???',
    color: '#ff0000',
    isSecret: true
  },
  Mexico: {
    name: 'Mexico',
    damage: 0,
    type: 'TRUMPY',
    color: '#FFD700',
    isTrumpyAttack: true
  },
  Ice: {
    name: 'Ice',
    damage: -50, // Négatif = soigne l'adversaire
    type: 'TRUMPY',
    color: '#00FFFF',
    isTrumpyAttack: true
  }
}
