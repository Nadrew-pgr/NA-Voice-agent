import fetch from 'node-fetch'
import { env } from '../env'
import { N8nPayload, LogEntry } from '../types'

export class N8nService {
  private webhookUrl: string
  private logger: (entry: LogEntry) => void

  constructor(logger: (entry: LogEntry) => void) {
    this.webhookUrl = env.N8N_WEBHOOK
    this.logger = logger
  }

  async sendPayload(payload: N8nPayload): Promise<void> {
    const startTime = Date.now()
    
    try {
      this.logger({
        timestamp: new Date().toISOString(),
        level: 'info',
        message: `Envoi vers n8n chunk ${payload.chunk_id}`,
        metadata: { 
          chunkId: payload.chunk_id, 
          courseId: payload.course_id,
          textLength: payload.text.length
        }
      })

      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const latency = Date.now() - startTime

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      this.logger({
        timestamp: new Date().toISOString(),
        level: 'info',
        message: `Envoi n8n réussi chunk ${payload.chunk_id}`,
        metadata: { 
          chunkId: payload.chunk_id, 
          latency,
          status: response.status
        }
      })

    } catch (error) {
      const latency = Date.now() - startTime
      
      this.logger({
        timestamp: new Date().toISOString(),
        level: 'error',
        message: `Erreur envoi n8n chunk ${payload.chunk_id}`,
        metadata: { 
          chunkId: payload.chunk_id, 
          latency,
          error: error instanceof Error ? error.message : 'Erreur inconnue'
        }
      })

      throw error
    }
  }

  async sendWithRetry(payload: N8nPayload, maxRetries: number = 5): Promise<void> {
    const delays = [200, 400, 800, 1600, 3200] // Délais de retry en ms
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        await this.sendPayload(payload)
        return // Succès, sortir de la boucle
      } catch (error) {
        if (attempt === maxRetries) {
          // Dernière tentative échouée, relancer l'erreur
          throw error
        }

        const delay = delays[Math.min(attempt, delays.length - 1)]
        
        this.logger({
          timestamp: new Date().toISOString(),
          level: 'warn',
          message: `Retry ${attempt + 1}/${maxRetries} pour chunk ${payload.chunk_id} dans ${delay}ms`,
          metadata: { 
            chunkId: payload.chunk_id, 
            attempt: attempt + 1,
            maxRetries,
            delay,
            error: error instanceof Error ? error.message : 'Erreur inconnue'
          }
        })

        // Attendre avant la prochaine tentative
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }
}
