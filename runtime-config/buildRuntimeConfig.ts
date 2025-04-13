function toCamelCase(str: string): string {
    return str.toLowerCase().replace(/[-_]+(.)/g, (_, c) => c.toUpperCase())
  }

  export function buildRuntimeConfig(env: Record<string, string>) {
    const privateVars: Record<string, string> = {}
    const publicVars: Record<string, string> = {}

    for (const key in env) {
      const value = env[key]
      const baseKey = key.replace(/^NUXT_PUBLIC_/, '').replace(/^NUXT_/, '')
      const camelKey = toCamelCase(baseKey)

      if (key.startsWith('NUXT_PUBLIC_')) {
        publicVars[camelKey] = value
      } else {
        privateVars[camelKey] = value
      }
    }

    return {
      private: privateVars,
      public: publicVars
    }
  }
