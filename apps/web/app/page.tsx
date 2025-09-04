'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import ChangelogLogs from './components/ChangelogLogs'
import StatsCards from './components/StatsCards'
import RecordingIndicator from './components/RecordingIndicator'
import { AnimatedThemeToggler } from './components/AnimatedThemeToggler'
import TranscriptDisplay from './components/TranscriptDisplay'

interface LogEntry {
  id: string
  timestamp: string
  message: string
  status?: 'success' | 'error' | 'info' | 'warning'
  duration?: number
  metadata?: any
}

interface TranscriptEntry {
  chunkId: string
  text: string
  timestamp: string
  courseId: string
}

export default function HomePage() {
  const [courseId, setCourseId] = useState('')
  const [chunkInterval, setChunkInterval] = useState(5)
  const [isRecording, setIsRecording] = useState(false)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [transcripts, setTranscripts] = useState<TranscriptEntry[]>([])
  const [chunkId, setChunkId] = useState(0)
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const startedAtRef = useRef<number>(0)
  const chunkCounterRef = useRef(0)
  const sendingRef = useRef(false)
  const queueRef = useRef<Blob[]>([])
  const flushIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Effet de rayons lumineux maintenant géré par CSS

  const addLog = useCallback((message: string, status?: 'success' | 'error' | 'info' | 'warning', duration?: number, metadata?: any) => {
    const log: LogEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString(),
      message,
      status,
      duration,
      metadata
    }
    setLogs(prev => [log, ...prev.slice(0, 49)])
    
    // Si c'est un log de transcription réussie, ajouter au transcript
    if (status === 'success' && metadata?.text && metadata?.chunkId) {
      const transcript: TranscriptEntry = {
        chunkId: metadata.chunkId,
        text: metadata.text,
        timestamp: new Date().toLocaleTimeString(),
        courseId: courseId
      }
      setTranscripts(prev => [transcript, ...prev.slice(0, 49)])
    }
  }, [courseId])


  const processQueue = useCallback(async () => {
    if (sendingRef.current) return
    sendingRef.current = true

    try {
      while (queueRef.current.length > 0) {
        const blob = queueRef.current.shift()!

        const currentId = ++chunkCounterRef.current
        setChunkId(currentId)
        const filename = `chunk_${String(currentId).padStart(6, '0')}.webm`

        const formData = new FormData()
        formData.append('file', blob, filename)
        formData.append('course_id', courseId)
        formData.append('chunk_id', String(currentId).padStart(6, '0'))
        formData.append('started_at', String(startedAtRef.current))

        const t0 = performance.now()
        let attempt = 0, ok = false
        while (attempt < 3 && !ok) {
          try {
            const res = await fetch('http://localhost:3002/ingest', { method: 'POST', body: formData })
            ok = res.status === 204
            if (!ok) throw new Error(`HTTP ${res.status}`)
          } catch (e) {
            attempt++
            if (attempt < 3) await new Promise(r => setTimeout(r, 300 * attempt))
            else throw e
          }
        }

        addLog(
          `Chunk ${currentId} envoyé`,
          'success',
          Math.round(performance.now() - t0),
          { chunkId: currentId, sizeKB: (blob.size / 1024).toFixed(1), courseId, timestamp: new Date().toISOString() }
        )
      }
    } catch (e: any) {
      addLog(`Upload: ${e?.message ?? e}`, 'error')
    } finally {
      sendingRef.current = false
    }
  }, [addLog, courseId])

  const startRecording = useCallback(async () => {
    if (!courseId.trim()) {
      addLog('Erreur: Veuillez saisir un ID de cours', 'error')
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const candidates = ['audio/webm;codecs=opus', 'audio/webm']
      const mime = candidates.find(m => MediaRecorder.isTypeSupported(m)) || ''
      if (!mime) {
        addLog('Aucun format MediaRecorder supporté.', 'error')
        return
      }

      const mr = new MediaRecorder(stream, { mimeType: mime, audioBitsPerSecond: 64000 })
      mediaRecorderRef.current = mr

      // reset compteurs
      chunkCounterRef.current = 0
      setChunkId(0)
      startedAtRef.current = Date.now()
      queueRef.current = []

      mr.ondataavailable = async (e) => {
        const blob = e.data
        if (!blob || blob.size === 0) return
        if (blob.size < 1000) {
          console.warn(`[Front] Chunk trop petit: ${blob.size} bytes`)
          return
        }
        queueRef.current.push(blob)
        if (!sendingRef.current) void processQueue()
      }

      mr.onerror = (ev) => {
        addLog(`MediaRecorder error: ${(ev as any).error?.message ?? 'unknown'}`, 'error')
      }

      mr.start() // pas de timeslice
      // flush manuel périodique
      flushIntervalRef.current = setInterval(() => {
        try { mr.requestData() } catch {}
      }, chunkInterval * 1000)
      setIsRecording(true)
      addLog(`Enregistrement démarré - Intervalle: ${chunkInterval}s`, 'success')

    } catch (err) {
      addLog(`Erreur accès micro: ${err instanceof Error ? err.message : 'Erreur inconnue'}`, 'error')
    }
  }, [courseId, chunkInterval, addLog, processQueue])

  const stopRecording = useCallback(async () => {
    const mr = mediaRecorderRef.current
    if (flushIntervalRef.current) {
      clearInterval(flushIntervalRef.current)
      flushIntervalRef.current = null
    }
    if (mr && mr.state !== 'inactive') {
      try { mr.requestData() } catch {}
      mr.stop()
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    while (sendingRef.current || queueRef.current.length > 0) {
      await new Promise(r => setTimeout(r, 50))
    }
    setIsRecording(false)
    addLog('Enregistrement arrêté', 'info')
  }, [addLog])

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  return (
    <div className={`min-h-screen relative overflow-hidden transition-colors duration-500 ${
      theme === 'dark' ? 'bg-black' : 'bg-gradient-to-br from-blue-50 to-indigo-100'
    }`}>
                                              {/* Arrière-plan simple et professionnel */}
                  <div className={`absolute inset-0 ${theme === 'dark' ? 'bg-gradient-to-br from-slate-900 to-black' : 'bg-gradient-to-br from-blue-50 to-indigo-100'}`} />

                  {/* Indicateur d'enregistrement ultra-moderne */}
                  <RecordingIndicator isRecording={isRecording} theme={theme} />

                  <div className="relative z-10 py-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header avec toggle de thème */}
          <div className="flex justify-between items-center mb-8">
                                                            <div className="text-center flex-1">
                          <h1 className={`text-5xl font-extrabold mb-6 tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                            Assistant IA Notes
                          </h1>
                          <div className="w-24 h-1 bg-gradient-to-r from-[#0066CC] via-[#0066CC]/80 to-[#0066CC]/60 mx-auto rounded-full mb-6" />
                          <p className={`text-lg font-medium leading-relaxed max-w-2xl mx-auto ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                            Enregistrement audio en temps réel avec transcription automatique
                          </p>
                        </div>
            
            {/* Toggle de thème animé Magic UI */}
            <AnimatedThemeToggler 
              theme={theme} 
              onThemeChange={setTheme} 
            />
          </div>

          {/* Carte principale simplifiée */}
          <div className={`glass rounded-2xl shadow-xl p-8 mb-8 ${
            theme === 'dark' ? 'shadow-[#0066CC]/10' : 'shadow-[#0066CC]/20'
          }`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-3">
                <label htmlFor="courseId" className={`block text-sm font-semibold uppercase tracking-wide ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                  ID du cours
                </label>
                                 <input
                   type="text"
                   id="courseId"
                   value={courseId}
                   onChange={(e) => setCourseId(e.target.value)}
                   placeholder="ex: cours-math-101"
                                                     className={`w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent transition-all duration-300 shine-border ${
                                    theme === 'dark' ? 'text-white placeholder-slate-400' : 'text-slate-800 placeholder-slate-500'
                                  }`}
                   disabled={isRecording}
                 />
              </div>
              
              <div className="space-y-3">
                <label htmlFor="interval" className={`block text-sm font-semibold uppercase tracking-wide ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                  Intervalle d'envoi (secondes)
                </label>
                                 <select
                   id="interval"
                   value={chunkInterval}
                   onChange={(e) => setChunkInterval(Number(e.target.value))}
                                                     className={`w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent transition-all duration-300 shine-border ${
                                    theme === 'dark' ? 'text-white' : 'text-slate-800'
                                  }`}
                   disabled={isRecording}
                 >
                  <option value={1}>1 seconde</option>
                  <option value={2}>2 secondes</option>
                  <option value={5}>5 secondes</option>
                  <option value={10}>10 secondes</option>
                </select>
              </div>
            </div>

                        {/* Boutons avec design professionnel */}
            <div className="flex justify-center space-x-4">
              <button
                onClick={startRecording}
                disabled={isRecording || !courseId.trim()}
                className={`px-8 py-3 rounded-xl font-semibold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                  isRecording 
                    ? 'bg-emerald-600 shadow-lg' 
                    : 'bg-[#0066CC] shadow-lg hover:bg-[#0066CC]/90 hover:shadow-xl'
                }`}
              >
                <span className="flex items-center justify-center">
                  {isRecording ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                      Démarrer
                    </>
                  )}
                </span>
              </button>
              
              <button
                onClick={stopRecording}
                disabled={!isRecording}
                className={`px-8 py-3 rounded-xl font-semibold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-red-600 shadow-lg hover:bg-red-700 hover:shadow-xl`}
              >
                <span className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                  </svg>
                  Arrêter
                </span>
              </button>
            </div>

            
          </div>

          {/* Cartes de statistiques */}
          <StatsCards 
            logs={logs}
            theme={theme}
            isRecording={isRecording}
            chunkId={chunkId}
            chunkInterval={chunkInterval}
          />

          {/* Section des transcripts en temps réel */}
          <div className={`glass rounded-2xl shadow-xl p-8 mb-8 ${
            theme === 'dark' ? 'shadow-[#0066CC]/10' : 'shadow-[#0066CC]/20'
          }`}>
            <TranscriptDisplay transcripts={transcripts} theme={theme} />
          </div>

          {/* Section des logs simplifiée */}
          <div className={`glass rounded-2xl shadow-xl p-8 ${
            theme === 'dark' ? 'shadow-[#0066CC]/10' : 'shadow-[#0066CC]/20'
          }`}>
            <ChangelogLogs logs={logs} theme={theme} />
          </div>
        </div>
      </div>
    </div>
  )
}
