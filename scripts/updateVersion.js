import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const packagePath = resolve(root, 'package.json')
const lockPath = resolve(root, 'package-lock.json')
const action = process.argv[2]
const validActions = ['major', 'minor', 'patch']

if (!validActions.includes(action)) {
  console.error(`Usage: node scripts/updateVersion.js <${validActions.join('|')}>`)
  process.exit(1)
}

const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'))
const lockJson = JSON.parse(readFileSync(lockPath, 'utf8'))
const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(packageJson.version)

if (!match) {
  throw new Error(`Invalid semantic version: ${packageJson.version}`)
}

let [, major, minor, patch] = match.map(Number)
if (action === 'major') {
  major += 1
  minor = 0
  patch = 0
} else if (action === 'minor') {
  minor += 1
  patch = 0
} else {
  patch += 1
}

packageJson.version = `${major}.${minor}.${patch}`
packageJson.revision = new Date().toISOString().slice(0, 16).replace(/[-:]/g, '').replace(/t/i, '.')
lockJson.version = packageJson.version
if (lockJson.packages?.['']) {
  lockJson.packages[''].version = packageJson.version
}

writeFileSync(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`)
writeFileSync(lockPath, `${JSON.stringify(lockJson, null, 2)}\n`)

console.log(`Version updated to ${packageJson.version}; revision updated to ${packageJson.revision}`)
