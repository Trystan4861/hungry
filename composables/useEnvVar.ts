// @trystan4861 - composable para acceder a variables del entorno

export function getEnvVar(key: string): string | null {
  const config = useRuntimeConfig()
  // Quitamos el prefijo NUXT_ y/o NUXT_PUBLIC_ para quedarnos con la parte importante
  const cleanKey = key
  .replace(/^NUXT_(PUBLIC_)?/i, '') // quitamos prefijos si los hay
  .toLowerCase()                    // pasamos todo a minúsculas
  .replace(/[-_]+(.)/g, (_, c) => c.toUpperCase()) // pasamos a camelCase
  // Si la clave original era pública, buscamos dentro de config.public
  if (key.toUpperCase().startsWith('NUXT_PUBLIC_')) {
    return cleanKey in config.public ? String(config.public[cleanKey]) : null
  }

  return cleanKey in config ? String(config[cleanKey]) : null
}