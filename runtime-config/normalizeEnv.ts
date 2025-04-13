import fs from 'fs'
import path from 'path'

export function normalizeEnv(): Record<string, string> {
  const envPath = path.resolve('.env')
  if (!fs.existsSync(envPath)) return {}

  const original = fs.readFileSync(envPath, 'utf-8')
  const lines = original.split(/\r?\n/)
  const seen = new Set()
  const output: string[] = []
  const parsed: Record<string, string> = {}

  for (const line of lines) {
    const trimmed = line.trim()

    // Comentarios o líneas vacías
    if (!trimmed || trimmed.startsWith('#')) {
      output.push(line)
      continue
    }

    // Encabezados tipo [SECCION]
    if (/^\[.+\]$/.test(trimmed)) {
      output.push(trimmed)
      continue
    }

    // Si no hay '=', mantenemos la línea como está
    if (!trimmed.includes('=')) {
      output.push(line)
      continue
    }

    const [rawKey, ...rest] = trimmed.split('=')
    const key = rawKey.trim().toUpperCase()
    const value = rest.join('=').trim()

    if (!seen.has(key)) {
      seen.add(key)
      output.push(`${key}=${value}`)
      parsed[key] = value
    }
  }

  const newContent = output.join('\n')
  if (newContent !== original) {
    fs.writeFileSync(envPath, newContent)
    console.log('✅ .env normalizado (con secciones preservadas).')
  }

  return parsed
}
