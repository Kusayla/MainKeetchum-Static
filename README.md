# 🚀 A$$ Keetchum - Version Statique

Version simplifiée du projet en HTML/CSS/JavaScript pur. **Déploiement ultra-simple sur GitHub Pages !**

## ✨ Avantages

- ✅ **100% statique** - Pas besoin de serveur PHP
- ✅ **Déploiement gratuit** sur GitHub Pages
- ✅ **Aucune configuration** - Juste push et ça marche
- ✅ **Rapide** - Pas de build, pas de Docker
- ✅ **Simple** - HTML/CSS/JS basique

## 📁 Structure

```
MainKeetchum-Static/
├── index.html          # Page d'accueil
├── game.html           # Page du jeu
├── css/
│   ├── style.css       # Styles de la landing page
│   └── game.css        # Styles du jeu
├── js/                 # Scripts JavaScript
├── data/               # Données du jeu (monstres, attaques, etc.)
├── img/                # Images
└── fonts/              # Polices
```

## 🚀 Déploiement sur GitHub Pages (2 minutes)

### 1. Créer un nouveau dépôt GitHub

```bash
cd MainKeetchum-Static
git init
git add .
git commit -m "Version statique A$$ Keetchum"
git remote add origin https://github.com/Kusayla/MainKeetchum-Static.git
git push -u origin main
```

### 2. Activer GitHub Pages

1. Allez sur https://github.com/Kusayla/MainKeetchum-Static
2. Settings → Pages
3. Source : `main` branch
4. Folder : `/ (root)`
5. Save

### 3. Votre site est en ligne !

Votre site sera disponible sur :
`https://kusayla.github.io/MainKeetchum-Static/`

## 📝 Notes

- Les fichiers doivent être copiés depuis le projet Symfony original
- Les chemins des images doivent être relatifs (pas de `{{ asset() }}`)
- Le jeu utilise Canvas HTML5, donc fonctionne directement dans le navigateur

## 🔧 Personnalisation

- Modifiez `index.html` pour changer la landing page
- Modifiez `game.html` pour changer le jeu
- Les styles sont dans `css/`

---

**C'est tout ! Beaucoup plus simple que Symfony + Docker + Render !** 🎉


