import { Mistral } from '@mistralai/mistralai'
import { env } from '../env'
import { LogEntry } from '../types'
import { webmToWav, isWebmFile } from '../audio'

export class TranscriptionService {
  private client: Mistral
  private logger: (entry: LogEntry) => void

  constructor(logger: (entry: LogEntry) => void) {
    this.client = new Mistral({ apiKey: env.MISTRAL_API_KEY })
    this.logger = logger
  }

  async transcribeAudio(
    audioBuffer: Buffer,
    chunkId: string,
    mimetype?: string,
    filename?: string
  ): Promise<string> {
    const startTime = Date.now()
    
    try {
      // Détection et conversion WebM → WAV si nécessaire
      let processedBuffer = audioBuffer
      let outputFilename = filename || `chunk_${chunkId}.webm`
      
      // Debug: Log des paramètres reçus
      this.logger({
        timestamp: new Date().toISOString(),
        level: 'info',
        message: `Debug chunk ${chunkId} - mimetype: "${mimetype}", filename: "${filename}"`,
        metadata: { chunkId, mimetype, filename, isWebm: isWebmFile(mimetype, filename) }
      })
      
      if (isWebmFile(mimetype, filename)) {
        this.logger({
          timestamp: new Date().toISOString(),
          level: 'info',
          message: `Conversion WebM → WAV chunk ${chunkId}`,
          metadata: { chunkId, bytes: audioBuffer.length, inputFormat: 'webm' }
        })
        
        processedBuffer = await webmToWav(audioBuffer)
        outputFilename = outputFilename.replace(/\.webm$/i, '.wav')
      }

      this.logger({
        timestamp: new Date().toISOString(),
        level: 'info',
        message: `Début transcription Mistral Voxtral chunk ${chunkId}`,
        metadata: { 
          chunkId, 
          bytes: processedBuffer.length, 
          model: 'voxtral-mini-latest',
          format: outputFilename.endsWith('.wav') ? 'wav' : 'original'
        }
      })

      // Transcription réelle avec Mistral Voxtral (100% aligné avec la doc officielle)
      const transcriptionResponse = await this.client.audio.transcriptions.complete({
        model: 'voxtral-mini-latest',
        file: { 
          fileName: outputFilename, 
          content: processedBuffer 
        },
        // language: "auto" (détection automatique par défaut)
        // timestamp_granularities: ["segment"] (optionnel pour la MVP)
      })

      const transcribedText = transcriptionResponse.text ?? `[Transcription vide pour chunk ${chunkId}]`
      const latency = Date.now() - startTime

      this.logger({
        timestamp: new Date().toISOString(),
        level: 'info',
        message: `Transcription Mistral Voxtral réussie chunk ${chunkId}`,
        metadata: { 
          chunkId, 
          bytes: audioBuffer.length, 
          latency, 
          textLength: transcribedText.length,
          model: 'voxtral-mini-latest',
          language: 'auto',
          note: 'Transcription réelle via API Mistral'
        }
      })

      return transcribedText

    } catch (error) {
      const latency = Date.now() - startTime
      
      this.logger({
        timestamp: new Date().toISOString(),
        level: 'error',
        message: `Erreur transcription Mistral Voxtral chunk ${chunkId}`,
        metadata: { 
          chunkId, 
          bytes: audioBuffer.length, 
          latency, 
          error: error instanceof Error ? error.message : 'Erreur inconnue',
          model: 'voxtral-mini-latest'
        }
      })

      throw error
    }
  }
}
