function rectangularCollision({ rectangle1, rectangle2 }) {
  return (
    rectangle1.position.x + rectangle1.width >= rectangle2.position.x &&
    rectangle1.position.x <= rectangle2.position.x + rectangle2.width &&
    rectangle1.position.y <= rectangle2.position.y + rectangle2.height &&
    rectangle1.position.y + rectangle1.height >= rectangle2.position.y
  )
}

function checkForCharacterCollision({
  characters,
  player,
  characterOffset = { x: 0, y: 0 }
}) {
  player.interactionAsset = null
  // monitor for character collision
  const detectionDistance = 40; // Distance de détection augmentée

  for (let i = 0; i < characters.length; i++) {
    const character = characters[i]

    // Vérifier la collision dans toutes les directions avec une distance suffisante
    const offsets = [
      characterOffset,  // Direction du mouvement actuel
      { x: 0, y: detectionDistance },   // En bas du joueur
      { x: 0, y: -detectionDistance },  // En haut du joueur
      { x: detectionDistance, y: 0 },   // À droite du joueur
      { x: -detectionDistance, y: 0 }   // À gauche du joueur
    ];

    for (const offset of offsets) {
      if (
        rectangularCollision({
          rectangle1: player,
          rectangle2: {
            ...character,
            position: {
              x: character.position.x + offset.x,
              y: character.position.y + offset.y
            }
          }
        })
      ) {
        player.interactionAsset = character
        break
      }
    }

    if (player.interactionAsset) break;
  }
}
