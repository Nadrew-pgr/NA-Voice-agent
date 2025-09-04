import { z } from 'zod'

// Schéma de validation pour la requête d'ingestion
export const ingestRequestSchema = z.object({
  course_id: z.string().min(1, 'course_id est requis'),
  chunk_id: z.string().min(1, 'chunk_id est requis'),
  started_at: z.string().transform((val) => {
    const num = Number(val)
    if (isNaN(num)) throw new Error('started_at doit être un nombre valide')
    return num
  }).pipe(z.number().min(0))
})

// Type dérivé du schéma
export type IngestRequest = z.infer<typeof ingestRequestSchema>

// Schéma pour la réponse vers n8n
export const n8nPayloadSchema = z.object({
  course_id: z.string(),
  chunk_id: z.string(),
  started_at: z.number(),
  text: z.string()
})

// Type dérivé du schéma
export type N8nPayload = z.infer<typeof n8nPayloadSchema>

// Interface pour les logs
export interface LogEntry {
  timestamp: string
  level: 'info' | 'warn' | 'error'
  message: string
  metadata?: Record<string, unknown>
}

// Interface pour les métriques de performance
export interface PerformanceMetrics {
  chunkId: string
  bytes: number
  transcriptionLatency: number
  n8nLatency: number
  totalLatency: number
}
