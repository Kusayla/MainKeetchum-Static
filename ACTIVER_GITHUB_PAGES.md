# 🔧 Activer GitHub Pages - Guide Complet

## ✅ Vérifications Préalables

### 1. Le dépôt existe-t-il ?
Allez sur : https://github.com/Kusayla/MainKeetchum-Static

- ✅ Si vous voyez le dépôt avec les fichiers → OK
- ❌ Si vous voyez 404 → Le dépôt n'existe pas encore, créez-le d'abord

### 2. Le code a-t-il été poussé ?
Vérifiez que vous voyez les fichiers dans le dépôt :
- `index.html`
- `game.html`
- `css/`
- `data/`
- `img/`

Si ces fichiers ne sont pas visibles, poussez le code :
```bash
cd /home/aylan/MainKeetchum-Static
git push -u origin main
```

---

## 🚀 Activer GitHub Pages

### Méthode 1 : Via l'Interface GitHub (Recommandé)

1. **Allez sur** : https://github.com/Kusayla/MainKeetchum-Static

2. **Cliquez sur** "Settings" (en haut du dépôt, à droite)

3. **Dans le menu de gauche**, cliquez sur **"Pages"** (dans la section "Code and automation")

4. **Configuration** :
   - **Source** : Sélectionnez `Deploy from a branch`
   - **Branch** : Sélectionnez `main`
   - **Folder** : Sélectionnez `/ (root)`
   - **Theme** : Laissez vide (pas besoin)

5. **Cliquez sur** "Save"

6. **Attendez 1-2 minutes** pour le déploiement

7. **Votre site sera disponible sur** :
   `https://kusayla.github.io/MainKeetchum-Static/`

### Méthode 2 : Vérifier les Paramètres

Si GitHub Pages est déjà activé mais ne fonctionne pas :

1. Vérifiez que la branche est `main` (pas `master`)
2. Vérifiez que le dossier est `/ (root)`
3. Vérifiez que le dépôt est **Public** (Settings → General → Danger Zone → Change visibility)

---

## 🐛 Dépannage

### Erreur 404 après activation

**Causes possibles :**
1. ⏱️ **Trop tôt** - Attendez 2-3 minutes après l'activation
2. 📁 **Mauvais dossier** - Vérifiez que c'est `/ (root)` et pas `/docs`
3. 🌿 **Mauvaise branche** - Vérifiez que c'est `main` et pas `master`
4. 🔒 **Dépôt privé** - Le dépôt doit être Public pour GitHub Pages gratuit

### Vérifier l'État du Déploiement

1. Allez sur Settings → Pages
2. Vous devriez voir un message vert : "Your site is live at..."
3. Si vous voyez une erreur, cliquez dessus pour voir les détails

### Forcer un Nouveau Déploiement

1. Allez sur Settings → Pages
2. Cliquez sur "Save" à nouveau (même si rien n'a changé)
3. Cela force un nouveau déploiement

---

## ✅ Checklist

- [ ] Le dépôt existe sur GitHub
- [ ] Le code a été poussé (fichiers visibles)
- [ ] Le dépôt est Public
- [ ] GitHub Pages est activé (Settings → Pages)
- [ ] Source : `main` branch
- [ ] Folder : `/ (root)`
- [ ] Attendu 2-3 minutes après activation

---

## 📝 Note

Si vous utilisez un compte GitHub **gratuit**, le dépôt **DOIT être Public** pour GitHub Pages gratuit.

Pour un dépôt privé avec GitHub Pages, il faut un compte GitHub Pro ($4/mois).

---

**Une fois activé, votre site sera en ligne en quelques minutes !** 🎉

