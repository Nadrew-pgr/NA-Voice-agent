import ffmpeg from "fluent-ffmpeg"
import { PassThrough } from "stream"
import fs from "fs"
// Use bundled static ffmpeg if available, else env or common system paths
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - types may resolve to string | null depending on platform
import ffmpegStaticPath from "ffmpeg-static"

// Configure ffmpeg path with sensible fallbacks
(() => {
  const candidates = [
    process.env.FFMPEG_PATH,
    (ffmpegStaticPath as unknown as string) || undefined,
    "/opt/homebrew/bin/ffmpeg", // macOS (Apple Silicon via Homebrew)
    "/usr/local/bin/ffmpeg",    // macOS (Intel) / Linux common
    "/usr/bin/ffmpeg"           // Linux
  ].filter(Boolean) as string[]

  const found = candidates.find(p => {
    try { fs.accessSync(p, fs.constants.X_OK); return true } catch { return false }
  })

  if (found) {
    ffmpeg.setFfmpegPath(found)
  } else {
    console.warn("[Audio] FFmpeg introuvable. Définissez FFMPEG_PATH ou installez ffmpeg (brew, apt).")
  }
})()

/**
 * Convertit un buffer WebM en buffer WAV pour Mistral
 * @param buffer Buffer WebM à convertir
 * @returns Promise<Buffer> Buffer WAV converti
 */
export async function webmToWav(buffer: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    // Validation du buffer
    if (!buffer || buffer.length === 0) {
      reject(new Error("Buffer audio vide"))
      return
    }

    // Validation magic bytes WebM
    if (buffer[0] !== 0x1A || buffer[1] !== 0x45 || buffer[2] !== 0xDF || buffer[3] !== 0xA3) {
      reject(new Error("Chunk WebM invalide (magic bytes)"))
      return
    }

    const input = new PassThrough()
    
    // Écriture du buffer dans le stream
    input.write(buffer)
    input.end()

    const chunks: Buffer[] = []
    
    const output = ffmpeg(input)
      .inputFormat("webm")
      .inputOptions(['-f', 'webm']) // force le demuxer
      .noVideo()
      .audioChannels(1)           // Mono
      .audioFrequency(16000)      // 16 kHz - optimal pour la STT
      .audioBitrate("64k")        // Bitrate optimisé
      .format("wav")
      .on("error", (error: any) => {
        console.error("[Audio] Erreur conversion ffmpeg:", error.message)
        reject(error)
      })
      .on("end", () => {
        const wavBuffer = Buffer.concat(chunks)
        console.log(`[Audio] Conversion WebM → WAV: ${buffer.length} → ${wavBuffer.length} bytes`)
        resolve(wavBuffer)
      })
      .pipe()

    output.on("data", (chunk: Buffer) => chunks.push(chunk))
  })
}

/**
 * Détecte si un fichier est au format WebM
 * @param mimetype Type MIME du fichier
 * @param filename Nom du fichier
 * @returns boolean True si c'est du WebM
 */
export function isWebmFile(mimetype?: string, filename?: string): boolean {
  return (
    mimetype?.startsWith("audio/webm") || 
    /\.webm$/i.test(filename || "")
  )
}
