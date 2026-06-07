# Handoff : AI Express — plateforme d'IA générative + backend

## Vue d'ensemble
**AI Express** est une plateforme web d'IA générative (texte, code, images) en
français/anglais. Modèle économique : un **« réservoir de données » en kilo-octets**
offert (500 Ko), puis paiement par paliers (« refaire le plein ») quand le réservoir
se vide — particulièrement vite quand l'utilisateur génère du code/des apps.
Inclut une **garde anti-multi-comptes** (IP + empreinte d'appareil + adresse de domicile).

Ce dossier contient **deux choses** :
1. les **fichiers de conception HTML** (prototype haute-fidélité) — sous `design_reference/` ;
2. la **spécification backend** pour rendre le service réel — `SCHEMA.sql` + `API.md`.

## À propos des fichiers de conception
Les fichiers de `design_reference/` sont des **références de conception réalisées en
HTML/React** — ils montrent l'apparence et le comportement voulus, **ce ne sont pas
des fichiers de production à copier tels quels**. La tâche est de **recréer ces écrans
dans l'environnement cible** (par ex. Next.js sur Vercel, recommandé ici) en suivant
ses conventions, puis de les **brancher au backend** décrit ci-dessous. Si aucun
codebase n'existe encore, **Next.js (App Router) + Supabase + Stripe** est la pile
conseillée et s'intègre nativement à Vercel.

## Fidélité
**Haute-fidélité (hifi).** Couleurs, typographie, espacements et interactions sont
définitifs. Recréer l'UI au pixel près avec les composants/lib du codebase cible.

---

## Écrans / Vues

### 1. Authentification (`auth.jsx`)
- **But :** inscription / connexion. Bilingue FR/EN (switch instantané).
- **Layout :** grille 2 colonnes. Gauche = argumentaire (titre, 3 features, jauge
  flottante). Droite = carte formulaire centrée (max 420px). Sous 900px : colonne
  gauche masquée, formulaire plein écran.
- **Formulaire :** onglets Connexion/Inscription. Champs **Inscription** : Nom,
  E-mail, **Adresse de domicile**, Mot de passe + encart sécurité. **Connexion** :
  E-mail, Mot de passe. Bouton primaire dégradé + « Continuer avec Google ».
- **Anti-fraude :** à la soumission, appeler `POST /api/signup-guard` **avant** de
  créer le compte. Si refusé → **écran de refus** (`BlockedOverlay`) : icône cadenas
  rouge, motif (IP / adresse / appareil), IP détectée, e-mail existant masqué,
  boutons « Se connecter à ce compte » / « Utiliser une autre identité ».

### 2. Application chat (`chat.jsx`, `chat-helpers.jsx`)
- **But :** générer texte / image / code, avec suivi du réservoir.
- **Layout :** sidebar 276px (marque, « Nouvelle conversation », historique, **jauge
  réservoir**, menu compte) + zone principale (fil de messages centré max 760px +
  composer en bas). Sous 900px : sidebar coulissante.
- **Composer :** zone de texte auto-extensible + 3 puces de mode (Texte / Image / Code).
  Entrée = envoyer, Maj+Entrée = nouvelle ligne.
- **Messages :** bulle utilisateur (pleine, à droite) / réponse IA (panneau, à gauche)
  avec **étiquette du coût en Ko**, rendu markdown léger, blocs de code copiables,
  bouton « Régénérer ». Mode image = carte placeholder (remplacer par la vraie image).
- **Branchement :** remplacer `window.claude.complete` par `POST /api/generate`
  (le serveur appelle le vrai modèle + mesure les Ko + décrémente le quota).

### 3. Jauge « réservoir de données » (`DataTank` dans `ui.jsx`)
- Barre segmentée (16 segments) qui se vide, % restant, Ko utilisés / restants.
- Couleur : accent → orange (≤18%) → rouge (vide). Sous 18% : bouton « Refaire le plein ».
- **Branchement :** alimenter depuis `GET /api/usage`.

### 4. Paywall « Refaire le plein » (`paywall.jsx`)
- **3 étapes :** plans → paiement → succès.
- **Plans :** Starter **$6**/mois, Pro **$20**/mois (« Le plus choisi »), Max **$50**/mois.
- **Déclenchement :** automatique quand le réservoir est vide, ou via les boutons « Refaire le plein ».
- **Branchement :** remplacer le formulaire de carte simulé par **Stripe Checkout**
  (`POST /api/checkout` → redirection). Le rechargement réel du réservoir se fait
  via le **webhook Stripe** (`/api/stripe/webhook`), pas côté client.

---

## Interactions & comportement
- **Animations :** entrées en fondu/slide (CSS), `cubic-bezier(0.22,1,0.36,1)`. La jauge
  s'anime en `.35s`. Un garde « timeline gelée » (`<script>` en fin de `index.html`)
  désactive les animations dans les environnements sans peinture (capture/SSR) —
  à retirer si le rendu cible gère les animations.
- **Persistance :** le prototype utilise localStorage ; en production tout passe par
  le backend (voir `API.md` → « Correspondance prototype → backend »).
- **États :** chargement (« réflexion » à points), refus anti-fraude, quota dépassé
  (402 → ouvre le paywall), succès de paiement.

## Gestion d'état (côté front, après branchement)
- `session` (Supabase Auth) · `usage { used_kb, quota_kb, plan }` (depuis l'API)
- `messages[]` par conversation · `mode` (text/image/code) · `paywallOpen` · `blocked`

## Design tokens (extraits — source complète : `design_reference/styles.css`)
- **Fonds :** `--bg oklch(0.15 0.022 258)`, surfaces `0.21 / 0.255 / 0.30`.
- **Texte :** `--text oklch(0.97 0.008 250)`, dim `0.74`, faint `0.56`.
- **Accents :** cyan `--accent oklch(0.80 0.150 218)`, violet `--accent-2 oklch(0.72 0.165 296)`,
  mint `--accent-3 oklch(0.82 0.150 175)` ; succès `158`, alerte `82`, danger `oklch(0.68 0.190 24)`.
- **Type :** display `Space Grotesk`, corps `IBM Plex Sans`, mono `IBM Plex Mono` (Google Fonts).
- **Rayons :** 10 / 16 / 24 / pill. **Échelle d'espacement :** 8 · 12 · 16.

## Assets
- **Favicon / marque :** `design_reference/favicon.svg` (éclair sur dégradé cyan→violet).
- **Icônes :** SVG inline dans `ui.jsx` (objet `Ic`). Aucune image externe.
- **Images générées :** placeholders rayés — à remplacer par un vrai service de
  génération d'images côté serveur.

---

## Mise en route du backend (résumé)
1. **Supabase** : créer un projet → SQL Editor → coller et exécuter **`SCHEMA.sql`**.
   Activer l'auth e-mail/mot de passe (et Google si voulu).
2. **Fonctions serveur** : implémenter les routes de **`API.md`** (Vercel Functions
   ou Supabase Edge Functions). La garde anti-fraude et la mesure des Ko **doivent**
   être côté serveur.
3. **IA** : brancher `/api/generate` sur un fournisseur (Anthropic/OpenAI) avec une
   clé serveur ; mesurer les Ko et appeler la fonction SQL `consume_kb`.
4. **Stripe** : créer 3 produits/prix (6/20/50), `/api/checkout` + webhook ;
   le webhook recharge le réservoir (`used_kb=0`, `quota_kb` du plan).
5. **Déploiement Vercel** : définir les variables d'environnement (voir fin de `API.md`),
   `index.html` (ou la page Next) comme entrée.

## Fichiers de ce dossier
- `README.md` — ce guide.
- `SCHEMA.sql` — schéma PostgreSQL/Supabase (tables, RLS, triggers, `consume_kb`).
- `API.md` — points d'API détaillés + correspondance prototype→backend + variables d'env.
- `design_reference/` — le prototype HTML complet (référence visuelle et comportementale).

> ⚠️ **Sécurité — non négociable :** mots de passe gérés par Supabase (jamais en clair),
> jamais de numéro de carte stocké (Stripe), clé IA & `service_role` **uniquement
> côté serveur**, anti-fraude et décompte des Ko **côté serveur**.
