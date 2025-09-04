import { z } from 'zod'
import dotenv from 'dotenv'

// Charger les variables d'environnement
dotenv.config()

// Schéma de validation des variables d'environnement
const envSchema = z.object({
  PORT: z.string().transform(Number).pipe(z.number().min(1).max(65535)),
  MISTRAL_API_KEY: z.string().min(1, 'MISTRAL_API_KEY est requis'),
  N8N_WEBHOOK: z.string().url('N8N_WEBHOOK doit être une URL valide')
})

// Valider et exporter les variables d'environnement
export const env = envSchema.parse(process.env)

// Types dérivés du schéma
export type Env = z.infer<typeof envSchema>
