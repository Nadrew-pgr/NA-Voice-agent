# Assistant IA Notes - MVP

Système de prise de notes audio en temps réel avec transcription automatique via Mistral AI et intégration n8n.

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Front Next.js │    │  Bridge Express │    │      n8n       │
│   Port: 3001    │───▶│   Port: 3002    │───▶│  Webhook       │
│                 │    │                 │    │                 │
│ • Enregistrement│    │ • Réception     │    │ • Traitement   │
│ • Découpage     │    │ • Transcription │    │ • Google Docs  │
│ • Envoi chunks  │    │ • Envoi n8n     │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📋 Prérequis

- **Node.js** ≥ 18
- **pnpm** (gestionnaire de paquets)
- **Clé API Mistral** (Voxtral)
- **n8n** configuré avec webhook

## 🚀 Installation

1. **Cloner le projet**
   ```bash
   git clone <repository-url>
   cd assistant-ia-notes
   ```

2. **Installer les dépendances**
   ```bash
   pnpm install
   ```

3. **Configuration des variables d'environnement**
   ```bash
   # Copier le fichier d'exemple
   cp apps/bridge/env.example apps/bridge/.env
   
   # Éditer apps/bridge/.env
   PORT=3002
   MISTRAL_API_KEY=sk-votre-cle-mistral
   N8N_WEBHOOK=http://localhost:5678/webhook/NA-Voice-Agent
   ```

## 🎯 Lancement

### Démarrage complet (web + bridge)
```bash
pnpm dev
```

### Démarrage séparé
```bash
# Terminal 1 - Application web
cd apps/web
pnpm dev

# Terminal 2 - Bridge Express
cd apps/bridge
pnpm dev
```

## 🌐 Accès

- **Frontend Next.js**: http://localhost:3001
- **Bridge Express**: http://localhost:3002
- **Health Check**: http://localhost:3002/health

## 🧪 Test rapide

### 1. Configuration n8n
Dans n8n, créer un webhook :
- **Méthode**: POST
- **Chemin**: `/webhook/NA-Voice-Agent`
- **Action**: Logger ou append dans Google Docs

### 2. Test d'enregistrement
1. Ouvrir http://localhost:3001
2. Saisir un `course_id` (ex: `cours-math-101`)
3. Sélectionner l'intervalle (défaut: 5s)
4. Cliquer **Démarrer** et autoriser le micro
5. Parler pendant 20-30 secondes
6. Vérifier les logs dans la console web (status 204)
7. Vérifier les POST arrivant dans n8n

## 📁 Structure du projet

```
assistant-ia-notes/
├── package.json                 # Workspaces + scripts
├── pnpm-workspace.yaml         # Configuration pnpm
├── README.md                   # Ce fichier
├── .gitignore                  # Exclusions Git
├── apps/
│   ├── web/                    # Frontend Next.js 15
│   │   ├── package.json       # Dépendances web
│   │   ├── tsconfig.json      # Config TypeScript
│   │   ├── next.config.js     # Config Next.js
│   │   ├── tailwind.config.js # Config Tailwind
│   │   ├── postcss.config.js  # Config PostCSS
│   │   └── app/               # App Router Next.js
│   │       ├── globals.css    # Styles Tailwind
│   │       ├── layout.tsx     # Layout principal
│   │       └── page.tsx       # Page Recorder
│   └── bridge/                 # Bridge Express TypeScript
│       ├── package.json       # Dépendances bridge
│       ├── tsconfig.json      # Config TypeScript
│       ├── env.example        # Variables d'env
│       └── src/               # Code source
│           ├── env.ts         # Validation env
│           ├── types.ts       # Types TypeScript
│           ├── server.ts      # Serveur Express
│           └── services/      # Services métier
│               ├── transcription.ts  # Service Mistral
│               └── n8n.ts           # Service n8n
```

## 🔧 Configuration détaillée

### Frontend (Next.js 15)
- **Port**: 3001 (imposé)
- **Technologies**: React 18, TypeScript, Tailwind CSS
- **Fonctionnalités**:
  - Enregistrement audio via MediaRecorder
  - Découpage en chunks configurables (1/2/5/10s)
  - Interface utilisateur moderne et responsive
  - Logs en temps réel

### Bridge (Express TypeScript)
- **Port**: 3002 (imposé)
- **Technologies**: Express, TypeScript, Zod, p-queue
- **Fonctionnalités**:
  - Réception multipart/form-data
  - Validation stricte des données
  - Queue FIFO pour traitement séquentiel
  - Transcription via Mistral Voxtral
  - Envoi vers n8n avec retry/backoff
  - Logs détaillés avec métriques

## 🔐 Sécurité

- **Clé API Mistral**: Jamais exposée côté frontend
- **CORS**: Restreint à `http://localhost:3001`
- **Validation**: Tous les inputs validés via Zod
- **Limites**: Fichiers audio max 10MB

## 📊 Métriques et monitoring

Le bridge logge automatiquement :
- Taille des chunks audio
- Latence de transcription Mistral
- Latence d'envoi n8n
- Taux d'erreur et retries
- Performance globale

## 🚨 Dépannage

### Erreurs courantes

#### CORS
```
Access to fetch at 'http://localhost:3002/ingest' from origin 'http://localhost:3001' has been blocked by CORS policy
```
**Solution**: Vérifier que le bridge est démarré sur le port 3002

#### Port occupé
```
Error: listen EADDRINUSE: address already in use :::3002
```
**Solution**: Changer le PORT dans `.env` ou arrêter le processus

#### Permissions micro
```
NotAllowedError: Permission denied
```
**Solution**: Autoriser l'accès au micro dans le navigateur

#### Clé API Mistral
```
Error: MISTRAL_API_KEY est requis
```
**Solution**: Configurer la clé dans `apps/bridge/.env`

### Logs de débogage

#### Frontend
- Console navigateur (F12)
- Logs dans l'interface utilisateur

#### Bridge
- Terminal où `pnpm dev` est lancé
- Format: `[TIMESTAMP] LEVEL | Message | Metadata`

## 🔄 Workflow complet

1. **Enregistrement** → Frontend capture l'audio
2. **Découpage** → Chunks envoyés toutes les N secondes
3. **Réception** → Bridge reçoit et valide
4. **Transcription** → Mistral Voxtral (language: "auto")
5. **Envoi** → POST vers n8n webhook
6. **Traitement** → n8n append dans Google Docs

## 📈 Évolutions futures

- [ ] Support de formats audio multiples
- [ ] Interface d'administration
- [ ] Base de données Supabase
- [ ] Authentification utilisateur
- [ ] Historique des sessions
- [ ] Export des transcriptions
- [ ] Intégration avec d'autres LLMs

## 🤝 Support

Pour toute question ou problème :
1. Vérifier les logs du bridge
2. Tester l'endpoint `/health`
3. Vérifier la configuration n8n
4. Consulter la console du navigateur

---

**Note**: Ce projet est configuré pour fonctionner immédiatement après `pnpm install` et `pnpm dev`. Assurez-vous d'avoir configuré votre clé API Mistral et votre webhook n8n avant de tester.
