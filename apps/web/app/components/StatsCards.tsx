'use client'

import { useState, useEffect } from 'react'

interface StatsCardsProps {
  logs: any[]
  theme: 'light' | 'dark'
  isRecording: boolean
  chunkId: number
  chunkInterval: number
}

export default function StatsCards({ logs, theme, isRecording, chunkId, chunkInterval }: StatsCardsProps) {
  const [animatedValues, setAnimatedValues] = useState({
    totalLogs: 0,
    successCount: 0,
    errorCount: 0,
    avgDuration: 0
  })

  useEffect(() => {
    const successCount = logs.filter(l => l.status === 'success').length
    const errorCount = logs.filter(l => l.status === 'error').length
    const durations = logs.filter(l => l.duration).map(l => l.duration)
    const avgDuration = durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0

    setAnimatedValues({
      totalLogs: logs.length,
      successCount,
      errorCount,
      avgDuration: Math.round(avgDuration)
    })
  }, [logs])

  const cards = [
    {
      title: 'Total des logs',
      value: animatedValues.totalLogs,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: 'blue',
      gradient: 'from-[#0066CC] to-[#0066CC]/80'
    },
    {
      title: 'Succès',
      value: animatedValues.successCount,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'green',
      gradient: 'from-green-500 to-green-600'
    },
    {
      title: 'Erreurs',
      value: animatedValues.errorCount,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'red',
      gradient: 'from-red-500 to-red-600'
    },
    {
      title: 'Durée moyenne',
      value: `${animatedValues.avgDuration}ms`,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'yellow',
      gradient: 'from-yellow-500 to-yellow-600'
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card, index) => (
        <div
          key={card.title}
          className={`rounded-2xl p-6 ${
            theme === 'dark' 
              ? 'bg-slate-800/50 border border-slate-700/50' 
              : 'bg-white/80 border border-slate-200/50'
          }`}
        >
          {/* Contenu */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className={`text-2xl ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                {card.icon}
              </div>
              <div className={`w-2 h-2 rounded-full bg-${card.color}-400 animate-pulse`} />
            </div>
            
            <div className="space-y-2">
              <h3 className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                {card.title}
              </h3>
              <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
                {card.value}
              </p>
            </div>
          </div>

          
        </div>
      ))}

      {/* Carte d'état d'enregistrement */}
      <div
        className={`sm:col-span-2 lg:col-span-4 rounded-2xl p-6 ${
          isRecording
            ? theme === 'dark'
              ? 'bg-green-900/20 border border-green-700/50'
              : 'bg-green-100/80 border border-green-300/50'
            : theme === 'dark'
            ? 'bg-slate-800/50 border border-slate-700/50'
            : 'bg-white/80 border border-slate-200/50'
        }`}
      >
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`text-2xl ${isRecording ? 'animate-pulse' : ''}`}>
                {isRecording ? '🔴' : '⚪'}
              </div>
              <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
                État d'enregistrement
              </h3>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              isRecording
                ? 'bg-green-500 text-white animate-pulse'
                : theme === 'dark'
                ? 'bg-slate-700 text-slate-300'
                : 'bg-slate-200 text-slate-600'
            }`}>
              {isRecording ? 'ACTIF' : 'INACTIF'}
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                Chunk actuel
              </p>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
                #{chunkId.toString().padStart(6, '0')}
              </p>
            </div>
            
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                Intervalle
              </p>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
                {chunkInterval}s
              </p>
            </div>
            
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                Statut
              </p>
              <p className={`text-lg font-medium ${isRecording ? 'text-green-500' : 'text-slate-500'}`}>
                {isRecording ? 'En cours...' : 'En attente'}
              </p>
            </div>
          </div>
        </div>


      </div>
    </div>
  )
}
