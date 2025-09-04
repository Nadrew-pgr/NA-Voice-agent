'use client'

interface RecordingIndicatorProps {
  isRecording: boolean
  theme: 'light' | 'dark'
}

export default function RecordingIndicator({ isRecording, theme }: RecordingIndicatorProps) {
  if (!isRecording) return null

  return (
    <div className="relative w-full h-32 flex items-center justify-center overflow-hidden">
      {/* Fond avec effet de lueur */}
      <div className={`absolute inset-0 ${theme === 'dark' ? 'bg-gradient-to-r from-red-900/20 to-pink-900/20' : 'bg-gradient-to-r from-red-50 to-pink-50'}`} />
      
      {/* Cercle central pulsant */}
      <div className="relative z-10">
        <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center animate-pulse shadow-lg">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-inner">
            <div className="w-5 h-5 bg-red-500 rounded-full" />
          </div>
        </div>
      </div>

      {/* Ondes sonores qui se propagent */}
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className={`absolute inset-0 rounded-full border-2 border-red-400/60 animate-ping`}
          style={{
            animationDelay: `${i * 0.2}s`,
            animationDuration: '2s',
            transform: `scale(${1 + i * 0.3})`,
          }}
        />
      ))}



      {/* Texte d'état */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <div className={`px-4 py-2 rounded-full text-sm font-medium ${
          theme === 'dark' 
            ? 'bg-red-500/20 text-red-300 border border-red-400/30' 
            : 'bg-red-100 text-red-700 border border-red-300'
        }`}>
          🔴 Enregistrement en cours
        </div>
      </div>
    </div>
  )
}
