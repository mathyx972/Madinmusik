# Madin Musik — mise en ligne et administration

## Ce que contient ce dossier

- `index.html` et `site.js` : le site (design de la V3).
- `content/` : tout le contenu du site (sons, mixtapes, vidéos, émissions, artistes, archives, fiches de l'index, publicités, textes). C'est ce dossier que la page admin modifie.
- `admin/` : la page d'administration, accessible à l'adresse `/admin` de ton site.
- `images/uploads/` : les images et fichiers audio que tu ajoutes depuis l'admin.

## Étape 1 — Mettre les fichiers sur GitHub (une seule fois, sur ordinateur)

1. Décompresse le fichier zip.
2. Ouvre ton dépôt `madinmusik` sur github.com.
3. Clique sur **uploading an existing file** (ou **Add file > Upload files**).
4. Ouvre le dossier décompressé, sélectionne **tout son contenu** (index.html, site.js, netlify.toml, admin, content, images, ce fichier) et fais-le glisser dans la page GitHub.
5. En bas, clique sur **Commit changes**.

## Étape 2 — Dépôt déjà configuré

La page admin est réglée sur le dépôt `mathyx972/madinmusik`. Si tu renommes le dépôt, change la ligne `repo:` dans `admin/config.yml`.

## Étape 3 — Brancher Netlify

1. Sur app.netlify.com : **Add new project > Import an existing project > GitHub**.
2. Choisis le dépôt `madinmusik`.
3. Laisse « Build command » vide, « Publish directory » sur `.`, puis **Deploy**.

## Étape 4 — Autoriser la connexion à l'admin

1. Sur GitHub : https://github.com/settings/developers > **OAuth Apps > New OAuth App**.
   - Application name : `Madin Musik admin`
   - Homepage URL : l'adresse de ton site Netlify (ex. `https://madinmusik.netlify.app`)
   - Authorization callback URL : `https://api.netlify.com/auth/done`
2. Clique sur **Register application**, note le **Client ID**, puis **Generate a new client secret** et copie-le tout de suite (il ne s'affiche qu'une fois).
3. Sur Netlify, dans ton projet : **Project configuration > Security > OAuth > Install provider > GitHub**, colle le Client ID et le secret, enregistre.

## Au quotidien

1. Va sur `https://ton-site/admin`, clique sur **Se connecter avec GitHub**.
2. Choisis une rubrique (Sons, Albums & mixtapes, Vidéos…), ajoute ou modifie, puis **Publier**.
3. Le site se met à jour tout seul en moins d'une minute.

Conseils :
- Les éléments marqués « Exemple » sont là pour montrer le fonctionnement : remplace-les ou supprime-les.
- Pour les morceaux complets, préfère un lien (YouTube, SoundCloud, Audiomack…) : les gros fichiers MP3 alourdissent le dépôt. Garde les fichiers audio pour des extraits courts.
- Pour une vidéo, colle simplement le lien YouTube : elle s'affiche directement sur le site.
- Toutes les modifications sont gardées dans l'historique de GitHub : rien n'est jamais perdu.
