# API Guide - Valentine Games Platform

## 📋 Informations

**Développeur:** ESSIMBI Louis Jos Deranot  
**Contact:** essimbideranot@gmail.com | +237 695 16 41 83

**Base URL:** `http://localhost:4200/api`  
**Format:** JSON  
**Authentification:** Aucune (pour le moment)

---

## 🎮 Memory Game API

### Créer un jeu

```http
POST /api/memory-games
Content-Type: application/json

{
  "finalMessage": "Je t'aime mon amour!",
  "difficultyLevel": "medium",
  "images": [
    "data:image/png;base64,...",
    "data:image/png;base64,...",
    ...
  ]
}
```

**Réponse (201):**
```json
{
  "id": "6bf40bc4-11f4-4f50-8086-94f8ac970ed9",
  "finalMessage": "Je t'aime mon amour!",
  "difficultyLevel": "medium",
  "createdAt": "2026-02-12T15:30:00.000Z"
}
```

### Récupérer un jeu

```http
GET /api/memory-games/:id
```

**Réponse (200):**
```json
{
  "id": "6bf40bc4-11f4-4f50-8086-94f8ac970ed9",
  "finalMessage": "Je t'aime mon amour!",
  "difficultyLevel": "medium",
  "images": [
    "data:image/png;base64,...",
    "data:image/png;base64,...",
    ...
  ],
  "createdAt": "2026-02-12T15:30:00.000Z"
}
```

### Sauvegarder le score

```http
POST /api/memory-games/:id/complete
Content-Type: application/json

{
  "timeSeconds": 120,
  "movesCount": 45
}
```

**Réponse (201):**
```json
{
  "message": "Score saved successfully",
  "timeSeconds": 120,
  "movesCount": 45,
  "completedAt": "2026-02-12T15:32:00.000Z"
}
```

---

## 💌 Secret Message API

### Créer un message

```http
POST /api/secret-messages
Content-Type: application/json

{
  "encryptedMessage": "U2FsdGVkX1...",
  "maxViews": 1,
  "expiresAt": "2026-02-14T23:59:59.000Z"
}
```

**Réponse (201):**
```json
{
  "id": "abc123def456",
  "maxViews": 1,
  "viewCount": 0,
  "expiresAt": "2026-02-14T23:59:59.000Z",
  "createdAt": "2026-02-12T15:30:00.000Z"
}
```

### Lire un message

```http
GET /api/secret-messages/:id
```

**Réponse (200):**
```json
{
  "id": "abc123def456",
  "encryptedMessage": "U2FsdGVkX1...",
  "viewCount": 1,
  "maxViews": 1,
  "isExpired": false,
  "createdAt": "2026-02-12T15:30:00.000Z"
}
```

**Note:** Le message est supprimé après avoir atteint `maxViews`.

---

## 🗺️ Treasure Hunt API

### Créer une chasse

```http
POST /api/treasure-hunts
Content-Type: application/json

{
  "title": "Notre Aventure",
  "finalMessage": "Tu as trouvé le trésor!",
  "steps": [
    {
      "title": "Étape 1",
      "clue": "Cherche où nous nous sommes rencontrés",
      "answer": "café",
      "location": {
        "lat": 48.8566,
        "lng": 2.3522
      }
    }
  ]
}
```

**Réponse (201):**
```json
{
  "id": "hunt123",
  "title": "Notre Aventure",
  "totalSteps": 1,
  "createdAt": "2026-02-12T15:30:00.000Z"
}
```

### Récupérer une chasse

```http
GET /api/treasure-hunts/:id
```

### Valider une étape

```http
POST /api/treasure-hunts/:id/validate
Content-Type: application/json

{
  "stepIndex": 0,
  "answer": "café"
}
```

**Réponse (200):**
```json
{
  "correct": true,
  "nextStep": 1,
  "completed": false
}
```

---

## 🎡 Love Wheel API

### Créer une roue

```http
POST /api/love-wheels
Content-Type: application/json

{
  "title": "Que faire ce soir?",
  "options": [
    "Dîner romantique",
    "Cinéma",
    "Promenade",
    "Soirée jeux"
  ]
}
```

**Réponse (201):**
```json
{
  "id": "wheel123",
  "title": "Que faire ce soir?",
  "optionsCount": 4,
  "createdAt": "2026-02-12T15:30:00.000Z"
}
```

### Récupérer une roue

```http
GET /api/love-wheels/:id
```

**Réponse (200):**
```json
{
  "id": "wheel123",
  "title": "Que faire ce soir?",
  "options": [
    "Dîner romantique",
    "Cinéma",
    "Promenade",
    "Soirée jeux"
  ],
  "createdAt": "2026-02-12T15:30:00.000Z"
}
```

---

## 📊 Analytics API

### Tracker un événement

```http
POST /api/analytics/track
Content-Type: application/json

{
  "eventType": "game_created",
  "gameType": "memory-game",
  "gameId": "6bf40bc4-11f4-4f50-8086-94f8ac970ed9",
  "metadata": {
    "difficultyLevel": "medium"
  }
}
```

**Réponse (201):**
```json
{
  "id": 1,
  "eventType": "game_created",
  "gameId": "6bf40bc4-11f4-4f50-8086-94f8ac970ed9",
  "gameType": "memory-game",
  "createdAt": "2026-02-12T15:30:00.000Z"
}
```

### Récupérer les statistiques

```http
GET /api/analytics/summary?days=30
```

**Réponse (200):**
```json
{
  "period": {
    "days": 30,
    "from": "2026-01-13T15:30:00.000Z",
    "to": "2026-02-12T15:30:00.000Z"
  },
  "summary": {
    "totalEvents": 1250,
    "uniqueGames": 450
  },
  "eventsByType": {
    "game_created": 450,
    "game_viewed": 500,
    "game_completed": 250,
    "share_clicked": 50
  },
  "eventsByGameType": {
    "memory-game": 600,
    "secret-message": 400,
    "treasure-hunt": 150,
    "love-wheel": 100
  }
}
```

### Événements d'un jeu

```http
GET /api/analytics/games/:gameId
```

**Réponse (200):**
```json
{
  "gameId": "6bf40bc4-11f4-4f50-8086-94f8ac970ed9",
  "events": [
    {
      "id": 1,
      "eventType": "game_created",
      "gameId": "6bf40bc4-11f4-4f50-8086-94f8ac970ed9",
      "gameType": "memory-game",
      "metadata": null,
      "createdAt": "2026-02-12T15:30:00.000Z"
    }
  ]
}
```

---

## ❌ Codes d'Erreur

### 400 Bad Request
```json
{
  "error": "Validation Error",
  "message": "Invalid input data",
  "statusCode": 400,
  "timestamp": "2026-02-12T15:30:00.000Z"
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "Memory game not found",
  "statusCode": 404,
  "timestamp": "2026-02-12T15:30:00.000Z"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "Failed to create memory game",
  "statusCode": 500,
  "timestamp": "2026-02-12T15:30:00.000Z"
}
```

### 503 Service Unavailable
```json
{
  "error": "Service Unavailable",
  "message": "Database not available in development mode",
  "statusCode": 503,
  "timestamp": "2026-02-12T15:30:00.000Z"
}
```

---

## 🔐 Validation des Données

### Memory Game
- `finalMessage`: string (1-5000 caractères)
- `difficultyLevel`: "easy" | "medium" | "hard"
- `images`: array de base64 strings (4, 6 ou 8 images selon difficulté)

### Secret Message
- `encryptedMessage`: string (chiffré AES-256)
- `maxViews`: number (1-10)
- `expiresAt`: ISO 8601 date string

### Treasure Hunt
- `title`: string (1-200 caractères)
- `finalMessage`: string (1-5000 caractères)
- `steps`: array (1-20 étapes)

### Love Wheel
- `title`: string (1-200 caractères)
- `options`: array de strings (2-12 options)

---

## 📝 Notes

- Toutes les dates sont au format ISO 8601
- Les images sont encodées en base64
- Les messages secrets sont chiffrés côté client
- Le rate limiting est appliqué sur toutes les routes
- Les analytics sont trackés de manière anonyme

---

**Développeur:** ESSIMBI Louis Jos Deranot  
**Version API:** 1.0.0  
**Dernière mise à jour:** 12 Février 2026
