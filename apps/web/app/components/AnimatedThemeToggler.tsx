"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

interface AnimatedThemeTogglerProps {
  className?: string
  theme: "light" | "dark"
  onThemeChange: (theme: "light" | "dark") => void
}

export function AnimatedThemeToggler({ className = "", theme, onThemeChange }: AnimatedThemeTogglerProps) {
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    onThemeChange(newTheme)
  }

  return (
    <motion.button
      onClick={toggleTheme}
      className={`relative w-12 h-12 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-200/50 dark:border-slate-700/50 ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <motion.div
        className="absolute inset-1 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 dark:from-blue-400 dark:to-purple-500"
        initial={false}
        animate={{
          scale: theme === "dark" ? 1 : 0,
          rotate: theme === "dark" ? 180 : 0,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      />
      
      <motion.div
        className="absolute inset-1 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500"
        initial={false}
        animate={{
          scale: theme === "light" ? 1 : 0,
          rotate: theme === "light" ? 0 : -180,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      />

      <motion.div
        className="absolute inset-2 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center"
        initial={false}
        animate={{
          rotate: theme === "dark" ? 180 : 0,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <motion.svg
          className="w-5 h-5 text-yellow-600 dark:text-blue-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          initial={false}
          animate={{
            opacity: theme === "light" ? 1 : 0,
            scale: theme === "light" ? 1 : 0.5,
          }}
          transition={{ duration: 0.2 }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </motion.svg>

        <motion.svg
          className="absolute w-5 h-5 text-blue-600 dark:text-blue-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          initial={false}
          animate={{
            opacity: theme === "dark" ? 1 : 0,
            scale: theme === "dark" ? 1 : 0.5,
          }}
          transition={{ duration: 0.2 }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </motion.svg>
      </motion.div>
    </motion.button>
  )
}
