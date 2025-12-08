# 📦 Créer le Dépôt GitHub

## Étapes

### 1. Créer le dépôt sur GitHub

1. Allez sur https://github.com/new
2. **Repository name** : `MainKeetchum-Static`
3. **Description** : "Version statique de A$$ Keetchum - Site web simple"
4. **Public** (pour GitHub Pages gratuit)
5. **Ne cochez PAS** "Initialize with README" (le dépôt existe déjà localement)
6. Cliquez sur **"Create repository"**

### 2. Pousser le code

Une fois le dépôt créé, exécutez :

```bash
cd /home/aylan/MainKeetchum-Static
git push -u origin main
```

### 3. Activer GitHub Pages

1. Allez sur https://github.com/Kusayla/MainKeetchum-Static
2. Cliquez sur **Settings** (en haut du dépôt)
3. Dans le menu de gauche, cliquez sur **Pages**
4. **Source** : Sélectionnez `main` branch
5. **Folder** : `/ (root)`
6. Cliquez sur **Save**

### 4. Votre site est en ligne !

Attendez 1-2 minutes, puis votre site sera disponible sur :
**https://kusayla.github.io/MainKeetchum-Static/**

---

## Alternative : Si vous préférez créer le dépôt via la ligne de commande

GitHub CLI (si installé) :
```bash
gh repo create MainKeetchum-Static --public --source=. --remote=origin --push
```

Mais la méthode manuelle (étape 1) est plus simple ! 😊

