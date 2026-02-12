# Valentine Games Platform - Documentation Technique

## 📋 Informations du Projet

**Nom du Projet:** Valentine Games Platform  
**Version:** 1.0.0  
**Développeur:** ESSIMBI Louis Jos Deranot  
**Contact:**
- 📱 WhatsApp: +237 695 16 41 83
- 📧 Email: essimbideranot@gmail.com

**Date de création:** 2025-2026  
**Framework:** Angular 21.1.3  
**Backend:** Node.js + Express  
**Base de données:** SQLite (better-sqlite3)

---

## 🎯 Vue d'ensemble

Valentine Games Platform est une application web interactive permettant de créer et partager des jeux romantiques pour la Saint-Valentin. La plateforme propose quatre types de jeux différents, chacun conçu pour créer des moments mémorables entre partenaires.

### Jeux disponibles

1. **Messages Cryptés** - Messages secrets chiffrés qui se révèlent une seule fois
2. **Memory Game** - Jeu de mémoire avec photos personnalisées
3. **Chasse au Trésor** - Parcours d'énigmes avec surprise finale
4. **Roue de l'Amour** - Roue interactive pour décider d'activités romantiques

---

## 🏗️ Architecture du Projet

### Structure des dossiers

```
valentine-games-platform/
├── src/
│   ├── app/
│   │   ├── core/                    # Services globaux
│   │   │   └── services/
│   │   │       ├── analytics.service.ts
│   │   │       ├── api.service.ts
│   │   │       └── toast.service.ts
│   │   ├── features/                # Modules fonctionnels
│   │   │   ├── home/
│   │   │   ├── memory-game/
│   │   │   ├── secret-message/
│   │   │   ├── treasure-hunt/
│   │   │   └── love-wheel/
│   │   ├── shared/                  # Composants partagés
│   │   │   └── components/
│   │   │       ├── header/
│   │   │       ├── footer/
│   │   │       ├── toast/
│   │   │       ├── confetti/
│   │   │       └── share-modal/
│   │   └── app.routes.ts
│   ├── server/                      # Backend Node.js
│   │   ├── api/
│   │   │   ├── controllers/
│   │   │   ├── routes/
│   │   │   ├── validators/
│   │   │   └── middleware/
│   │   ├── database/
│   │   │   ├── db.ts
│   │   │   └── migrations/
│   │   └── tasks/
│   └── assets/                      # Ressources statiques
├── public/                          # Fichiers publics
└── dist/                           # Build de production
```

---

## 🎮 Fonctionnalités Détaillées

### 1. Memory Game

#### Création du jeu
- **Composant:** `memory-game/components/create/`
- **Fonctionnalités:**
  - Sélection de difficulté (4, 6 ou 8 paires)
  - Upload d'images avec preview
  - Barre de progression du chargement
  - Message final personnalisé
  - Génération de lien unique

#### Gameplay
- **Composant:** `memory-game/components/play/`
- **Fonctionnalités:**
  - Chronomètre démarrant au premier clic
  - Compteur de coups
  - Compteur de paires trouvées
  - Animation de retournement des cartes
  - Écran de victoire avec statistiques

#### API Endpoints
```typescript
POST   /api/memory-games          // Créer un jeu
GET    /api/memory-games/:id      // Récupérer un jeu
POST   /api/memory-games/:id/complete  // Sauvegarder le score
```

### 2. Messages Cryptés

#### Sécurité
- **Chiffrement:** AES-256 côté client
- **Clé:** Générée aléatoirement et incluse dans l'URL
- **Lecture unique:** Message supprimé après consultation

#### Composants
- `secret-message/components/create/` - Création
- `secret-message/components/view/` - Visualisation

#### API Endpoints
```typescript
POST   /api/secret-messages       // Créer un message
GET    /api/secret-messages/:id   // Lire le message
```

### 3. Chasse au Trésor

#### Fonctionnalités
- Création d'étapes avec énigmes
- Support de différents types d'indices
- Géolocalisation optionnelle
- Message final révélé à la fin

#### Composants
- `treasure-hunt/components/create/` - Création
- `treasure-hunt/components/play/` - Jeu
- `treasure-hunt/components/step/` - Étape individuelle

### 4. Roue de l'Amour

#### Fonctionnalités
- Canvas HTML5 pour le rendu
- Animation de rotation fluide
- Options personnalisables
- Résultat aléatoire équitable

#### Composants
- `love-wheel/components/create/` - Configuration
- `love-wheel/components/play/` - Jeu
- `love-wheel/components/canvas/` - Rendu canvas

---

## 🔧 Services Principaux

### ApiService
**Fichier:** `src/app/core/services/api.service.ts`

Service centralisé pour toutes les requêtes HTTP.

```typescript
// Méthodes disponibles
get<T>(endpoint: string): Observable<T>
post<T>(endpoint: string, data: any): Observable<T>
put<T>(endpoint: string, data: any): Observable<T>
delete<T>(endpoint: string): Observable<T>
```

**Gestion des erreurs:**
- Retry automatique (1 fois) pour les GET
- Gestion des erreurs AbortError (navigation)
- Messages d'erreur formatés

### AnalyticsService
**Fichier:** `src/app/core/services/analytics.service.ts`

Tracking des événements utilisateur.

```typescript
// Événements trackés
trackGameCreated(gameType: string, gameId: string)
trackGameViewed(gameType: string, gameId: string)
trackGameCompleted(gameType: string, gameId: string, metadata?: any)
trackShareClicked(gameType: string, gameId: string, platform: string)
```

**Caractéristiques:**
- Tracking silencieux (n'affecte pas l'UX)
- Vérification isPlatformBrowser (SSR-safe)
- Stockage en base de données SQLite

### ToastService
**Fichier:** `src/app/core/services/toast.service.ts`

Système de notifications toast.

```typescript
// Types de toast
success(message: string, duration?: number)
error(message: string, duration?: number)
info(message: string, duration?: number)
warning(message: string, duration?: number)
```

---

## 🗄️ Base de Données

### Schéma SQLite

#### Table: memory_games
```sql
CREATE TABLE memory_games (
  id TEXT PRIMARY KEY,
  final_message TEXT NOT NULL,
  difficulty_level TEXT NOT NULL,
  created_at TEXT NOT NULL
);
```

#### Table: memory_images
```sql
CREATE TABLE memory_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  game_id TEXT NOT NULL,
  image_data TEXT NOT NULL,
  position INTEGER NOT NULL,
  FOREIGN KEY (game_id) REFERENCES memory_games(id)
);
```

#### Table: memory_scores
```sql
CREATE TABLE memory_scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  game_id TEXT NOT NULL,
  time_seconds INTEGER NOT NULL,
  moves_count INTEGER NOT NULL,
  completed_at TEXT NOT NULL,
  FOREIGN KEY (game_id) REFERENCES memory_games(id)
);
```

#### Table: analytics_events
```sql
CREATE TABLE analytics_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_type TEXT NOT NULL,
  game_id TEXT,
  game_type TEXT,
  metadata TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TEXT NOT NULL
);
```

### Migrations
**Fichier:** `src/server/database/migrations/001_initial_schema.sql`

Les migrations sont exécutées automatiquement au démarrage du serveur.

---

## 🎨 Composants Partagés

### Header
**Fichier:** `src/app/shared/components/header/`

Navigation principale avec:
- Logo animé
- Menu desktop/mobile
- Bouton CTA qui apparaît au scroll
- Effet de transparence sur la page d'accueil

### Footer
**Fichier:** `src/app/shared/components/footer/`

Pied de page avec:
- Liens vers les jeux
- Mentions légales
- Animation du logo

### Toast
**Fichier:** `src/app/shared/components/toast/`

Notifications avec:
- 4 types (success, error, info, warning)
- Animation d'entrée/sortie
- Auto-fermeture configurable
- Bouton de fermeture manuel

### Confetti
**Fichier:** `src/app/shared/components/confetti/`

Animation de confettis pour les célébrations:
- 50 particules colorées
- Animation de chute avec rotation
- Auto-nettoyage après 3.5s

### ShareModal
**Fichier:** `src/app/shared/components/share-modal/`

Modal de partage avec:
- Copie du lien
- Partage WhatsApp
- Partage Facebook
- Génération de QR code

---

## 🔐 Sécurité

### Chiffrement des Messages
- **Algorithme:** AES-256-GCM
- **Implémentation:** Web Crypto API (navigateur)
- **Clé:** 256 bits générée aléatoirement
- **Stockage:** Clé dans l'URL, message chiffré en base

### Headers de Sécurité
**Fichier:** `src/server.ts`

```typescript
helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
      fontSrc: ["'self'", "fonts.gstatic.com", "data:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'", "http://localhost:*"]
    }
  }
})
```

### Validation des Données
**Fichier:** `src/server/api/middleware/validation.ts`

Utilisation de Zod pour la validation:
```typescript
const schema = z.object({
  field: z.string().min(1).max(5000)
});
```

### Rate Limiting
**Fichier:** `src/server/api/middleware/rate-limiter.ts`

Protection contre les abus:
- Limite par IP
- Fenêtre temporelle configurable

---

## 🚀 Déploiement

### Build de Production

```bash
# Installation des dépendances
npm install

# Build du projet
npm run build

# Démarrage du serveur
npm run serve:ssr:valentine-games-platform
```

### Variables d'Environnement

```env
# Port du serveur
PORT=4000

# Chemin de la base de données
DATABASE_PATH=database.sqlite

# Mode de développement
NODE_ENV=production

# CORS
CORS_ORIGIN=*
```

### Configuration Serveur

**Prérequis:**
- Node.js 18+
- NPM 9+
- SQLite3

**Fichiers importants:**
- `server.ts` - Point d'entrée du serveur
- `angular.json` - Configuration Angular
- `tsconfig.json` - Configuration TypeScript

---

## 🧪 Tests

### Tests Unitaires
```bash
npm run test
```

### Tests E2E
```bash
npm run e2e
```

### Fichiers de test
- `*.spec.ts` - Tests unitaires
- `*.e2e.spec.ts` - Tests end-to-end

---

## 📊 Analytics

### Événements Trackés

1. **game_created** - Création d'un jeu
2. **game_viewed** - Consultation d'un jeu
3. **game_completed** - Fin d'un jeu
4. **share_clicked** - Clic sur partage

### Données Collectées
- Type d'événement
- ID du jeu
- Type de jeu
- Métadonnées (scores, temps, etc.)
- IP et User-Agent (anonymisés)
- Timestamp

### API Analytics
```typescript
GET /api/analytics/summary?days=30
GET /api/analytics/games/:gameId
```

---

## 🎨 Styles et Thème

### Variables CSS Globales
**Fichier:** `src/styles.scss`

```scss
:root {
  --color-primary: #FF0055;
  --color-secondary: #C9184A;
  --color-accent: #FFD700;
  --color-midnight: #0f0514;
  --color-dark: #1a0a19;
}
```

### Animations
- Fade-in au chargement
- Hover effects sur les cartes
- Transitions fluides
- Animations de confettis

### Responsive Design
- Mobile-first approach
- Breakpoints: 768px, 1024px, 1300px
- Menu mobile avec overlay

---

## 🐛 Résolution de Problèmes

### Problème: SharedStylesHost Error
**Solution:** Extraction des styles inline vers des fichiers SCSS externes

### Problème: Timer ne s'actualise pas
**Solution:** Utilisation de ChangeDetectorRef.markForCheck()

### Problème: Images ne s'affichent pas
**Solution:** Ajout de setTimeout et scroll automatique après chargement

### Problème: Base de données non disponible
**Solution:** Vérification de isDatabaseAvailable() avant les requêtes

---

## 📝 Conventions de Code

### Naming
- **Composants:** PascalCase (ex: `MemoryGameComponent`)
- **Services:** PascalCase + Service (ex: `ApiService`)
- **Fichiers:** kebab-case (ex: `memory-game.component.ts`)
- **Variables:** camelCase (ex: `gameId`)
- **Constantes:** UPPER_SNAKE_CASE (ex: `MAX_IMAGES`)

### Structure des Composants
```typescript
@Component({
  selector: 'app-component-name',
  standalone: true,
  imports: [...],
  templateUrl: './component.html',
  styleUrls: ['./component.scss']
})
export class ComponentName implements OnInit, OnDestroy {
  // Properties
  // Constructor
  // Lifecycle hooks
  // Public methods
  // Private methods
}
```

### Commentaires
- JSDoc pour les méthodes publiques
- Commentaires inline pour la logique complexe
- TODO pour les améliorations futures

---

## 🔄 Workflow de Développement

### Branches Git
- `main` - Production
- `develop` - Développement
- `feature/*` - Nouvelles fonctionnalités
- `fix/*` - Corrections de bugs

### Commits
Format: `type(scope): message`

Types:
- `feat` - Nouvelle fonctionnalité
- `fix` - Correction de bug
- `docs` - Documentation
- `style` - Formatage
- `refactor` - Refactoring
- `test` - Tests
- `chore` - Maintenance

---

## 📚 Ressources Externes

### Dépendances Principales
- **Angular:** Framework frontend
- **Express:** Framework backend
- **better-sqlite3:** Base de données
- **Zod:** Validation de schémas
- **Helmet:** Sécurité HTTP
- **Lucide Angular:** Icônes

### Documentation
- [Angular Docs](https://angular.dev)
- [Express Docs](https://expressjs.com)
- [SQLite Docs](https://www.sqlite.org/docs.html)

---

## 🎯 Roadmap

### Version 1.1
- [ ] Système de comptes utilisateurs
- [ ] Historique des jeux créés
- [ ] Thèmes personnalisables
- [ ] Support multilingue

### Version 1.2
- [ ] Mode multijoueur
- [ ] Classements globaux
- [ ] Badges et achievements
- [ ] Intégration réseaux sociaux

### Version 2.0
- [ ] Application mobile (Ionic)
- [ ] Mode hors ligne
- [ ] Notifications push
- [ ] Nouveaux types de jeux

---

## 📞 Support et Contact

**Développeur:** ESSIMBI Louis Jos Deranot

**Contact:**
- 📱 WhatsApp: +237 695 16 41 83
- 📧 Email: essimbideranot@gmail.com

**Heures de disponibilité:** Lundi - Vendredi, 9h - 18h (GMT+1)

**Délai de réponse:** 24-48 heures

---

## 📄 Licence

© 2025-2026 Valentine Games Platform by ESSIMBI Louis Jos Deranot  
Tous droits réservés.

---

**Dernière mise à jour:** 12 Février 2026  
**Version de la documentation:** 1.0.0
