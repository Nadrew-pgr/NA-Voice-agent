import express from 'express'
import cors from 'cors'
import multer from 'multer'
import PQueue from 'p-queue'
import { env } from './env'
import { TranscriptionService } from './services/transcription'
import { N8nService } from './services/n8n'
import { ingestRequestSchema, N8nPayload, LogEntry } from './types'

// Configuration du serveur
const app = express()
const port = env.PORT

// Configuration CORS
app.use(cors({
  origin: 'http://localhost:3001',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}))

// Configuration Multer pour le traitement des fichiers
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
    files: 1
  },
  fileFilter: (_req, file, cb) => {
    // En mode développement, accepter plus de types de fichiers pour les tests
    if (file.mimetype === 'audio/webm' || 
        file.mimetype === 'audio/mpeg' || 
        file.mimetype === 'audio/wav' ||
        file.mimetype === 'application/octet-stream' || // Pour les fichiers de test
        file.mimetype === 'text/plain') { // Pour les fichiers de test
      cb(null, true)
    } else {
      cb(new Error(`Type de fichier non supporté: ${file.mimetype}. Types acceptés: audio/webm, audio/mpeg, audio/wav`))
    }
  }
})

// Queue FIFO pour le traitement des chunks
const processingQueue = new PQueue({ concurrency: 1 })

// Logger simple
const logger = (entry: LogEntry): void => {
  const timestamp = entry.timestamp
  const level = entry.level.toUpperCase().padEnd(5)
  const message = entry.message
  const metadata = entry.metadata ? ` | ${JSON.stringify(entry.metadata)}` : ''
  
  console.log(`[${timestamp}] ${level} | ${message}${metadata}`)
}

// Services
const transcriptionService = new TranscriptionService(logger)
const n8nService = new N8nService(logger)

// Route de santé
app.get('/health', (_req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() })
})

// Route d'ingestion des chunks audio
app.post('/ingest', upload.single('file'), async (req, res) => {
  try {
    // Validation des champs
    const validationResult = ingestRequestSchema.safeParse({
      course_id: req.body.course_id,
      chunk_id: req.body.chunk_id,
      started_at: req.body.started_at
    })

    if (!validationResult.success) {
      logger({
        timestamp: new Date().toISOString(),
        level: 'error',
        message: 'Validation des champs échouée',
        metadata: { 
          errors: validationResult.error.errors,
          body: req.body
        }
      })
      return res.status(400).json({ 
        error: 'Données invalides', 
        details: validationResult.error.errors 
      })
    }

    // Validation du fichier
    if (!req.file) {
      logger({
        timestamp: new Date().toISOString(),
        level: 'error',
        message: 'Aucun fichier audio reçu',
        metadata: { body: req.body }
      })
      return res.status(400).json({ error: 'Fichier audio requis' })
    }

    const { course_id, chunk_id, started_at } = validationResult.data
    const audioBuffer = req.file.buffer

    logger({
      timestamp: new Date().toISOString(),
      level: 'info',
      message: `Chunk reçu ${chunk_id}`,
      metadata: { 
        chunkId: chunk_id, 
        courseId: course_id, 
        bytes: audioBuffer.length,
        startedAt: started_at,
        mimetype: req.file.mimetype,
        filename: req.file.originalname
      }
    })

    // Répondre immédiatement avec 204
    res.status(204).send()

    // Ajouter le traitement à la queue
    processingQueue.add(async () => {
      try {
        const totalStartTime = Date.now()
        
        // Étape 1: Transcription via Mistral
        const text = await transcriptionService.transcribeAudio(
          audioBuffer, 
          chunk_id,
          req.file?.mimetype,
          req.file?.originalname
        )
        
        const transcriptionLatency = Date.now() - totalStartTime
        
        // Étape 2: Envoi vers n8n
        const n8nStartTime = Date.now()
        
        const payload: N8nPayload = {
          course_id,
          chunk_id,
          started_at,
          text
        }
        
        await n8nService.sendWithRetry(payload)
        
        const n8nLatency = Date.now() - n8nStartTime
        const totalLatency = Date.now() - totalStartTime
        
        // Log de succès avec métriques
        logger({
          timestamp: new Date().toISOString(),
          level: 'info',
          message: `Traitement complet chunk ${chunk_id}`,
          metadata: {
            chunkId: chunk_id,
            courseId: course_id,
            bytes: audioBuffer.length,
            textLength: text.length,
            transcriptionLatency,
            n8nLatency,
            totalLatency
          }
        })
        
      } catch (error) {
        logger({
          timestamp: new Date().toISOString(),
          level: 'error',
          message: `Erreur traitement chunk ${chunk_id}`,
          metadata: {
            chunkId: chunk_id,
            courseId: course_id,
            bytes: audioBuffer.length,
            error: error instanceof Error ? error.message : 'Erreur inconnue'
          }
        })
      }
    })

    return undefined // Retour explicite pour satisfaire TypeScript

  } catch (error) {
    logger({
      timestamp: new Date().toISOString(),
      level: 'error',
      message: 'Erreur lors de la réception du chunk',
      metadata: { 
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        body: req.body
      }
    })
    
    // Si la réponse n'a pas encore été envoyée
    if (!res.headersSent) {
      res.status(500).json({ error: 'Erreur interne du serveur' })
    }
    return undefined
  }
})

// Gestionnaire d'erreurs global
app.use((error: Error, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger({
    timestamp: new Date().toISOString(),
    level: 'error',
    message: 'Erreur serveur non gérée',
    metadata: { 
      error: error.message,
      stack: error.stack,
      url: req.url,
      method: req.method
    }
  })
  
  if (!res.headersSent) {
    // Gérer spécifiquement les erreurs de validation de fichiers
    if (error.message.includes('Type de fichier non supporté')) {
      res.status(400).json({ 
        error: 'Type de fichier non supporté',
        details: error.message,
        acceptedTypes: ['audio/webm', 'audio/mpeg', 'audio/wav']
      })
    } else {
      res.status(500).json({ error: 'Erreur interne du serveur' })
    }
  }
})

// Démarrage du serveur
app.listen(port, () => {
  logger({
    timestamp: new Date().toISOString(),
    level: 'info',
    message: `Serveur bridge démarré sur le port ${port}`,
    metadata: { 
      port,
      mistralApiKey: env.MISTRAL_API_KEY ? '***' : 'NON_DÉFINI',
      n8nWebhook: env.N8N_WEBHOOK
    }
  })
})

// Gestion gracieuse de l'arrêt
process.on('SIGTERM', () => {
  logger({
    timestamp: new Date().toISOString(),
    level: 'info',
    message: 'Arrêt gracieux du serveur...'
  })
  
  processingQueue.clear()
  process.exit(0)
})

process.on('SIGINT', () => {
  logger({
    timestamp: new Date().toISOString(),
    level: 'info',
    message: 'Arrêt gracieux du serveur...'
  })
  
  processingQueue.clear()
  process.exit(0)
})
