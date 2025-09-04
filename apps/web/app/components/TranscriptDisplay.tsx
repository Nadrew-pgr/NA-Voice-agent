'use client'

interface TranscriptEntry {
  chunkId: string
  text: string
  timestamp: string
  courseId: string
}

interface TranscriptDisplayProps {
  transcripts: TranscriptEntry[]
  theme: 'light' | 'dark'
}

export default function TranscriptDisplay({ transcripts, theme }: TranscriptDisplayProps) {
  if (transcripts.length === 0) {
    return (
      <div className={`text-center py-8 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
        <div className="text-4xl mb-4">🎤</div>
        <p className="text-lg">Aucune transcription encore</p>
        <p className="text-sm">Commencez l'enregistrement pour voir les transcripts</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
        📝 Transcripts en Temps Réel ({transcripts.length} chunks)
      </div>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {transcripts.map((entry, index) => (
          <div
            key={`${entry.courseId}-${entry.chunkId}-${index}`}
            className={`p-4 rounded-lg border ${
              theme === 'dark' 
                ? 'bg-slate-800/50 border-slate-700 text-white' 
                : 'bg-white/80 border-slate-200 text-slate-800'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  theme === 'dark' 
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30' 
                    : 'bg-blue-100 text-blue-700 border border-blue-300'
                }`}>
                  Chunk {entry.chunkId}
                </span>
                <span className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                  {entry.courseId}
                </span>
              </div>
              <span className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                {entry.timestamp}
              </span>
            </div>
            
            <div className={`text-sm leading-relaxed ${
              theme === 'dark' ? 'text-slate-200' : 'text-slate-700'
            }`}>
              {entry.text}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
