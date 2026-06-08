# 🚀 Déployer AI Express sur Vercel avec OpenAI

Suivez ces étapes **dans l'ordre**. Aucune compétence technique avancée requise.

---

## Ce qu'il vous faut
- ✅ Votre **clé API OpenAI** (vous l'avez déjà — elle commence par `sk-...`)
- ✅ Un compte **Vercel** (gratuit) — créez-en un sur vercel.com
- ✅ Les fichiers du projet (listés plus bas)

---

## Étape 1 — Préparez le dossier à déployer
Mettez **tous ces fichiers ensemble**, en respectant la structure (le dossier `api`
contient `generate.js`) :

```
mon-site/
├── index.html
├── favicon.svg
├── styles.css
├── app.jsx
├── i18n.jsx
├── antifraud.jsx
├── ui.jsx
├── chat-helpers.jsx
├── auth.jsx
├── chat.jsx
├── paywall.jsx
└── api/
    └── generate.js      ← la fonction serveur qui parle à OpenAI
```

> ⚠️ Le fichier `generate.js` **doit** être dans un sous-dossier nommé exactement
> `api`. C'est ainsi que Vercel sait que c'est une fonction serveur.

---

## Étape 2 — Importez le projet dans Vercel
1. Connectez-vous sur **vercel.com**.
2. Cliquez **« Add New… » → « Project »**.
3. Deux façons :
   - **Simple** : glissez-déposez votre dossier `mon-site` (option « Deploy » sans Git), **ou**
   - **Recommandé** : mettez les fichiers sur **GitHub** puis « Import » le dépôt
     (permet les mises à jour automatiques).
4. Quand Vercel demande le **Framework Preset**, laissez **« Other »** (c'est un site statique).
5. **Ne déployez pas encore** — d'abord l'étape 3 (la clé).

---

## Étape 3 — Ajoutez votre clé OpenAI (CRUCIAL 🔑)
La clé ne doit **jamais** être dans les fichiers du site. On la met dans Vercel :

1. Dans la page d'import (ou plus tard : **Project → Settings → Environment Variables**).
2. Ajoutez une variable :
   - **Name** (nom) : `OPENAI_API_KEY`
   - **Value** (valeur) : collez votre clé `sk-...`
3. Laissez les 3 environnements cochés (Production, Preview, Development).
4. **Save**.

---

## Étape 4 — Déployez
Cliquez **« Deploy »**. Patientez ~1 minute. Vercel vous donne une URL
(`https://mon-site.vercel.app`). Ouvrez-la : créez un compte, et **le chat répond
maintenant pour de vrai** via OpenAI. 🎉

> Si vous aviez déjà déployé **avant** d'ajouter la clé : allez dans
> **Deployments → … → Redeploy** pour que la clé soit prise en compte.

---

## Vérifier que tout marche
- **Texte / Code** → réponses réelles de `gpt-4o-mini`.
- **Image** → vraie image générée par DALL·E 3.
- Si un message ⚙️ *« IA indisponible »* apparaît : voir « Problèmes courants ».

---

## 💳 Coûts — important
- **Vercel** : gratuit pour ce type de site.
- **OpenAI** : **payant à l'usage** — chaque réponse/image vous est facturée par OpenAI
  (pas par Vercel). Surveillez votre consommation sur platform.openai.com et
  **définissez une limite de dépense** (Settings → Limits). Le « réservoir de Ko »
  du site limite vos utilisateurs, mais c'est **vous** qui payez OpenAI derrière.

---

## Problèmes courants
| Symptôme | Cause / Solution |
|---|---|
| ⚙️ « IA indisponible » | La clé n'est pas définie ou le déploiement est antérieur. → Ajoutez `OPENAI_API_KEY` puis **Redeploy**. |
| Erreur 401 d'OpenAI | Clé invalide/expirée → recréez-en une. |
| Erreur 429 | Quota OpenAI dépassé ou pas de moyen de paiement → ajoutez un paiement sur OpenAI. |
| Le mode Image échoue | DALL·E nécessite un compte OpenAI avec crédit. |
| La page d'accueil est vide | Le fichier doit s'appeler `index.html` (déjà le cas ✅). |

---

## ⚠️ Ce qui n'est PAS encore réel (rappel)
Cette étape branche **l'IA**. Restent simulés tant qu'un backend complet n'est pas
ajouté (voir `API.md` + `SCHEMA.sql`) :
- les **comptes** et l'**anti-fraude** (encore dans le navigateur) ;
- le **paiement** (le paywall ne facture pas vraiment — il faut **Stripe**) ;
- le **décompte des Ko** (devrait être vérifié côté serveur).

Pour ces points, ouvrez le dossier `design_handoff_aiexpress_backend/`.
