# Guide de démarrage rapide - Assistant IA Notes

## État actuel : ✅ Application totalement fonctionnelle

L'application est maintenant totalement fonctionnelle et prête à l'emploi.

## Architecture

L'application est composée de deux parties :
- **App Web** (port 3001) : Interface utilisateur pour l'enregistrement audio
- **Bridge Server** (port 3002) : Serveur backend pour le traitement audio et la transcription

## Démarrage rapide

### 1. Installation des dépendances (déjà fait)
```bash
pnpm install
```

### 2. Configuration (déjà fait)
Le fichier `.env` a été créé dans `apps/bridge/.env` avec la configuration de base :
- PORT=3002
- MISTRAL_API_KEY=sk-REPLACE_ME (à remplacer avec votre clé API Mistral)
- N8N_WEBHOOK=http://localhost:5678/webhook/NA-Voice-Agent

### 3. Démarrer l'application
```bash
pnpm dev
```

Cela démarre simultanément :
- L'app web sur http://localhost:3001
- Le serveur bridge sur http://localhost:3002

## Utilisation

1. Ouvrez http://localhost:3001 dans votre navigateur
2. Entrez un ID de cours
3. Cliquez sur "Démarrer l'enregistrement" pour capturer l'audio
4. L'audio est automatiquement découpé et envoyé au serveur bridge
5. Le serveur bridge transcrit l'audio et envoie les résultats au webhook N8N

## API Endpoints

### Bridge Server (port 3002)
- `GET /health` : Vérification de l'état du serveur
- `POST /ingest` : Upload et traitement des chunks audio

## Configuration importante

### Pour une utilisation en production :
1. Remplacez `MISTRAL_API_KEY` dans `apps/bridge/.env` avec votre vraie clé API
2. Configurez l'URL du webhook N8N selon votre installation
3. Ajustez les paramètres CORS si nécessaire

## Fonctionnalités

- ✅ Enregistrement audio en temps réel
- ✅ Découpage automatique en chunks
- ✅ Transcription via Mistral AI
- ✅ Interface moderne avec thème clair/sombre
- ✅ Logs en temps réel
- ✅ Statistiques de performance
- ✅ Gestion des erreurs et retry automatique

## Dépannage

Si vous rencontrez des problèmes :

1. Vérifiez que les ports 3001 et 3002 sont libres
2. Assurez-vous que votre clé API Mistral est valide
3. Vérifiez les logs dans la console pour plus de détails

## Scripts disponibles

- `pnpm dev` : Démarre en mode développement
- `pnpm build` : Construit pour la production
- `pnpm start` : Démarre en mode production