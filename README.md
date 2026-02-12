# Valentine Games Platform 💝

Une plateforme interactive pour créer et partager des jeux romantiques pour la Saint-Valentin.

## 👨‍💻 Développeur

**ESSIMBI Louis Jos Deranot**
- 📱 WhatsApp: +237 695 16 41 83
- 📧 Email: essimbideranot@gmail.com

## 🎮 Fonctionnalités

- **Messages Cryptés** - Messages secrets chiffrés AES-256
- **Memory Game** - Jeu de mémoire avec photos personnalisées
- **Chasse au Trésor** - Parcours d'énigmes interactif
- **Roue de l'Amour** - Roue interactive pour décider d'activités

## 🚀 Installation

```bash
# Cloner le repository
git clone <repository-url>

# Installer les dépendances
npm install

# Lancer en développement
npm run dev

# Build de production
npm run build

# Lancer le serveur SSR
npm run serve:ssr:valentine-games-platform
```

## 🛠️ Technologies

- **Frontend:** Angular 21.1.3
- **Backend:** Node.js + Express
- **Base de données:** SQLite (better-sqlite3)
- **Sécurité:** Helmet, AES-256 encryption
- **Validation:** Zod
- **Styling:** SCSS

## 📁 Structure du Projet

```
src/
├── app/
│   ├── core/          # Services globaux
│   ├── features/      # Modules fonctionnels
│   └── shared/        # Composants partagés
├── server/            # Backend Node.js
│   ├── api/          # Routes et contrôleurs
│   └── database/     # SQLite + migrations
└── assets/           # Ressources statiques
```

## 🔐 Sécurité

- Chiffrement AES-256 pour les messages secrets
- Headers de sécurité avec Helmet
- Validation des données avec Zod
- Rate limiting sur les API
- Protection CSRF

## 📊 Base de Données

SQLite avec les tables suivantes:
- `memory_games` - Jeux de memory
- `memory_images` - Images des jeux
- `memory_scores` - Scores des joueurs
- `secret_messages` - Messages chiffrés
- `treasure_hunts` - Chasses au trésor
- `love_wheels` - Roues de l'amour
- `analytics_events` - Événements trackés

## 🧪 Tests

```bash
# Tests unitaires
npm run test

# Tests E2E
npm run e2e
```

## 📝 Documentation

Voir [DOCUMENTATION.md](./DOCUMENTATION.md) pour la documentation complète.

## 📄 Licence

© 2025-2026 Valentine Games Platform by ESSIMBI Louis Jos Deranot

---

**Version:** 1.0.0  
**Dernière mise à jour:** 12 Février 2026
