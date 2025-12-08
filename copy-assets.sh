#!/bin/bash

# Script pour copier les assets depuis le projet Symfony

SOURCE_DIR="../MainKeetchum/public"
DEST_DIR="."

echo "📦 Copie des assets depuis le projet Symfony..."

# Créer les dossiers de destination
mkdir -p img data fonts css

# Copier les images
echo "📸 Copie des images..."
cp -r "$SOURCE_DIR/img"/* img/ 2>/dev/null || echo "⚠️  Images non trouvées"

# Copier les données du jeu
echo "🎮 Copie des données du jeu..."
cp -r "$SOURCE_DIR/data"/* data/ 2>/dev/null || echo "⚠️  Données non trouvées"

# Copier les polices
echo "🔤 Copie des polices..."
cp -r "$SOURCE_DIR/fonts"/* fonts/ 2>/dev/null || echo "⚠️  Polices non trouvées"

# Copier et adapter le CSS
echo "🎨 Copie du CSS..."
if [ -f "$SOURCE_DIR/build/app.css" ]; then
    cp "$SOURCE_DIR/build/app.css" css/style.css
    # Remplacer les chemins Symfony par des chemins relatifs
    sed -i 's|/build/|../|g' css/style.css
    sed -i 's|{{ asset(||g' css/style.css
    sed -i 's|) }}||g' css/style.css
    echo "✅ CSS copié et adapté"
else
    echo "⚠️  CSS non trouvé, création d'un CSS basique"
fi

echo "✅ Copie terminée !"
echo ""
echo "📝 Prochaines étapes :"
echo "1. Vérifiez que tous les fichiers sont bien copiés"
echo "2. Testez le site localement (ouvrez index.html dans un navigateur)"
echo "3. Poussez sur GitHub et activez GitHub Pages"

