import { defineNuxtModule } from '@nuxt/kit'
import { normalizeEnv } from '../runtime-config/normalizeEnv'
import { buildRuntimeConfig } from '../runtime-config/buildRuntimeConfig'

export default defineNuxtModule({
  meta: {
    name: 'dynamic-runtime-config',
    configKey: 'dynamicRuntimeConfig'
  },
  async setup(_, nuxt) {
    const env = normalizeEnv()
    const runtime = buildRuntimeConfig(env)

    nuxt.options.runtimeConfig = {
      ...nuxt.options.runtimeConfig,
      ...runtime.private,
      public: {
        ...nuxt.options.runtimeConfig.public,
        ...runtime.public
      }
    }
    console.log('✅ runtimeConfig generado dinámicamente desde .env')
  }
})