'use client'

import { useState, useEffect } from 'react'

interface LogEntry {
  id: string
  timestamp: string
  message: string
  status?: 'success' | 'error' | 'info' | 'warning'
  duration?: number
  metadata?: any
}

interface ChangelogLogsProps {
  logs: LogEntry[]
  theme: 'light' | 'dark'
}

export default function ChangelogLogs({ logs, theme }: ChangelogLogsProps) {
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([])
  const [filter, setFilter] = useState<'all' | 'success' | 'error' | 'info' | 'warning'>('all')

  useEffect(() => {
    if (filter === 'all') {
      setFilteredLogs(logs)
    } else {
      setFilteredLogs(logs.filter(log => log.status === filter))
    }
  }, [logs, filter])

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'success':
        return (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
            <svg className="h-4 w-4 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )
      case 'error':
        return (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            <svg className="h-4 w-4 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        )
      case 'warning':
        return (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/20">
            <svg className="h-4 w-4 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        )
      case 'info':
        return (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
            <svg className="h-4 w-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        )
      default:
        return (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
            <svg className="h-4 w-4 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        )
    }
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'success':
        return 'border-green-200 dark:border-green-800'
      case 'error':
        return 'border-red-200 dark:border-red-800'
      case 'warning':
        return 'border-yellow-200 dark:border-yellow-800'
      case 'info':
        return 'border-blue-200 dark:border-blue-800'
      default:
        return 'border-gray-200 dark:border-gray-700'
    }
  }

  const getStatusTextColor = (status?: string) => {
    switch (status) {
      case 'success':
        return 'text-green-700 dark:text-green-300'
      case 'error':
        return 'text-red-700 dark:text-red-300'
      case 'warning':
        return 'text-yellow-700 dark:text-yellow-300'
      case 'info':
        return 'text-blue-700 dark:text-blue-300'
      default:
        return theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header avec filtres */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
            Timeline d'activité
          </h2>
          <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
            {filteredLogs.length} entrée{filteredLogs.length > 1 ? 's' : ''} affichée{filteredLogs.length > 1 ? 's' : ''}
          </p>
        </div>
        
        {/* Filtres */}
        <div className="flex flex-wrap gap-2">
          {(['all', 'success', 'error', 'info', 'warning'] as const).map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                filter === filterType
                  ? 'bg-blue-500 text-white shadow-lg'
                  : theme === 'dark'
                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {filterType === 'all' && 'Tous'}
              {filterType === 'success' && 'Succès'}
              {filterType === 'error' && 'Erreurs'}
              {filterType === 'info' && 'Info'}
              {filterType === 'warning' && 'Avertissements'}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline des logs */}
      <div className="relative">
                            {/* Ligne de timeline */}
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#0066CC] via-[#0066CC]/80 to-[#0066CC]/60" />
        
        <div className="space-y-4">
          {filteredLogs.length === 0 ? (
            <div className={`text-center py-12 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
              <svg className="mx-auto h-12 w-12 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-lg font-medium">Aucun log à afficher</p>
              <p className="text-sm">Les logs apparaîtront ici lors de l'enregistrement</p>
            </div>
          ) : (
                         filteredLogs.map((log, index) => (
                                         <div
                            key={log.id}
                            className={`flex gap-4 ${
                              theme === 'dark' ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'
                            }`}
                          >
                {/* Icône de statut */}
                <div className="relative z-10 flex-shrink-0">
                  {getStatusIcon(log.status)}
                </div>

                {/* Contenu du log */}
                <div className={`flex-1 min-w-0 pb-4 border-l-2 pl-4 ${getStatusColor(log.status)}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${getStatusTextColor(log.status)}`}>
                        {log.message}
                      </p>
                      {log.metadata && (
                        <div className={`mt-2 text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                          {Object.entries(log.metadata).map(([key, value]) => (
                            <span key={key} className="inline-block mr-3">
                              <span className="font-medium">{key}:</span> {String(value)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col items-end gap-1 text-xs">
                      <span className={`font-mono ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                        {log.timestamp}
                      </span>
                      {log.duration && (
                        <span className="px-2 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 font-medium">
                          {log.duration}ms
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Footer avec statistiques */}
      {logs.length > 0 && (
        <div className={`pt-6 border-t ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                {logs.filter(l => l.status === 'success').length}
              </div>
              <div className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Succès</div>
            </div>
            <div>
              <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>
                {logs.filter(l => l.status === 'error').length}
              </div>
              <div className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Erreurs</div>
            </div>
            <div>
              <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                {logs.filter(l => l.status === 'info').length}
              </div>
              <div className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Info</div>
            </div>
            <div>
              <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`}>
                {logs.filter(l => l.status === 'warning').length}
              </div>
              <div className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Avertissements</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
