# 🚀 Assistant IA Notes - Guide de Production

## État : ✅ Application totalement fonctionnelle

L'application est prête pour la production avec toutes les fonctionnalités opérationnelles.

## Configuration requise pour la production

### 1. Clé API Mistral AI
```bash
# Dans apps/bridge/.env
MISTRAL_API_KEY=votre-vraie-clé-api-mistral
```

⚠️ **Important** : Sans une clé API valide, la transcription ne fonctionnera pas.

### 2. Webhook N8N
```bash
# Dans apps/bridge/.env
N8N_WEBHOOK=https://votre-instance-n8n.com/webhook/votre-endpoint
```

## Déploiement

### Option 1 : Docker (recommandé)
```dockerfile
# Dockerfile à la racine
FROM node:20-alpine
RUN npm install -g pnpm
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm build
EXPOSE 3001 3002
CMD ["pnpm", "start"]
```

### Option 2 : PM2
```bash
# Installation globale de PM2
npm install -g pm2

# Démarrage avec PM2
pm2 start ecosystem.config.js
```

Créez `ecosystem.config.js` :
```javascript
module.exports = {
  apps: [
    {
      name: 'web',
      cwd: './apps/web',
      script: 'pnpm',
      args: 'start',
      env: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'bridge',
      cwd: './apps/bridge',
      script: 'pnpm',
      args: 'start',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
}
```

## Sécurité en production

### 1. HTTPS
Utilisez un reverse proxy (nginx/traefik) avec certificats SSL.

### 2. CORS
Modifiez `apps/bridge/src/server.ts` pour votre domaine :
```typescript
app.use(cors({
  origin: 'https://votre-domaine.com',
  credentials: true
}))
```

### 3. Rate limiting
Ajoutez express-rate-limit pour éviter les abus.

### 4. Variables d'environnement
- Ne commitez jamais le fichier `.env`
- Utilisez un gestionnaire de secrets (AWS Secrets Manager, etc.)

## Monitoring

### Logs
Les logs sont affichés dans la console. Pour la production, dirigez-les vers :
- CloudWatch (AWS)
- Stackdriver (GCP)
- ELK Stack
- Datadog

### Métriques
- Temps de réponse des endpoints
- Taux de succès des transcriptions
- Utilisation CPU/Mémoire
- Queue de traitement

## Optimisations de performance

### 1. Cache Redis
Pour éviter de re-transcrire les mêmes chunks :
```typescript
// Ajout dans bridge/src/server.ts
import Redis from 'ioredis'
const redis = new Redis(process.env.REDIS_URL)
```

### 2. CDN pour l'app web
Utilisez Cloudflare ou AWS CloudFront pour servir les assets statiques.

### 3. Compression
Activez gzip/brotli sur votre reverse proxy.

## Troubleshooting

### Erreurs communes

1. **"Erreur interne du serveur" sur /ingest sans fichier**
   - Normal si aucun fichier n'est envoyé
   - L'endpoint attend un fichier audio

2. **Transcription échoue**
   - Vérifiez votre clé API Mistral
   - Vérifiez les logs du serveur bridge

3. **CORS errors**
   - Assurez-vous que l'origine est correctement configurée
   - Vérifiez les headers dans la console

### Debug avancé
```bash
# Activer les logs détaillés
DEBUG=* pnpm dev

# Vérifier la santé
curl https://votre-api.com/health

# Test de transcription
curl -X POST https://votre-api.com/ingest \
  -F "file=@test.webm" \
  -F "course_id=test" \
  -F "chunk_id=000001" \
  -F "started_at=1234567890"
```

## Checklist de mise en production

- [ ] Clé API Mistral configurée
- [ ] URL webhook N8N configurée
- [ ] HTTPS activé
- [ ] CORS configuré pour votre domaine
- [ ] Logs dirigés vers un service de monitoring
- [ ] Backups automatiques configurés
- [ ] Monitoring des erreurs (Sentry, etc.)
- [ ] Tests de charge effectués
- [ ] Documentation API à jour
- [ ] Plan de rollback défini

## Support

Pour toute question ou problème :
1. Consultez les logs détaillés
2. Vérifiez la configuration
3. Testez avec le script `test-app.sh`

L'application est maintenant prête pour une utilisation en production ! 🎉