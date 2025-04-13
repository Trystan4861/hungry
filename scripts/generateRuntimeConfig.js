const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const CONFIG_FILE = path.resolve('nuxt.config.ts');
const ENV_FILE = path.resolve('.env');

// CamelCase helper
function toCamelCase(str) {
  return str.toLowerCase().replace(/[-_]+(.)/g, (_, c) => c.toUpperCase());
}

// Normaliza el .env y devuelve un objeto de claves
function normalizeEnvFile() {
  if (!fs.existsSync(ENV_FILE)) {
    console.warn('⚠️ No se encontró el archivo .env.');
    return {};
  }

  const original = fs.readFileSync(ENV_FILE, 'utf8');
  const lines = original.split('\n');
  const output = [];
  const seen = new Set();
  const parsed = {};

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      output.push(line);
      continue;
    }

    const [rawKey, ...rest] = line.split('=');
    const key = rawKey.trim().toUpperCase();
    const value = rest.join('=');

    if (!seen.has(key)) {
      seen.add(key);
      output.push(`${key}=${value}`);
      parsed[key] = value;
    } else {
      console.warn(`⚠️ Clave duplicada ignorada tras normalización: ${key}`);
    }
  }

  const newContent = output.join('\n');
  if (newContent !== original) {
    fs.writeFileSync(ENV_FILE, newContent);
    console.log('✅ .env normalizado.');
  } else {
    console.log('ℹ️ .env ya estaba normalizado.');
  }

  return parsed;
}

function buildRuntimeConfig(env) {
  const priv = {};
  const pub = {};

  for (const key in env) {
    const camel = toCamelCase(
      key.replace(/^NUXT_PUBLIC_/, '').replace(/^NUXT_/, '')
    );
    if (key.startsWith('NUXT_PUBLIC_')) {
      pub[camel] = `process.env.${key}`;
    } else {
      priv[camel] = `process.env.${key}`;
    }
  }

  const privBlock = Object.entries(priv)
    .map(([k, v]) => `    ${k}: ${v},`)
    .join('\n') || '    // No private vars';

  const pubBlock = Object.entries(pub)
    .map(([k, v]) => `      ${k}: ${v},`)
    .join('\n') || '      // No public vars';

  return `  runtimeConfig: {\n${privBlock}\n\n    public: {\n${pubBlock}\n    }\n  }`;
}

function updateNuxtConfig(runtimeBlock) {
  if (!fs.existsSync(CONFIG_FILE)) {
    console.error('❌ nuxt.config.ts no encontrado.');
    process.exit(1);
  }

  let config = fs.readFileSync(CONFIG_FILE, 'utf8');
  const hasRuntime = /runtimeConfig\s*:\s*{[\s\S]*?\n\s*}(,?)/;

  if (hasRuntime.test(config)) {
    config = config.replace(hasRuntime, `${runtimeBlock}$1`);
  } else {
    config = config.replace(
      /defineNuxtConfig\(\s*{([\s\S]*?)}/m,
      (_, inner) => `defineNuxtConfig({\n${runtimeBlock},\n${inner.trim()}\n})`
    );
  }

  fs.writeFileSync(CONFIG_FILE, config);
  console.log('✅ runtimeConfig actualizado en nuxt.config.ts');
}

// Ejecutar
const env = normalizeEnvFile();
if (Object.keys(env).length === 0) {
  console.warn('⚠️ No se encontraron variables válidas en el .env.');
  process.exit(0);
}

const runtimeBlock = buildRuntimeConfig(env);
updateNuxtConfig(runtimeBlock);
