// scripts/updateVersion.js

const fs = require('fs');
const { execSync } = require('child_process');

// Obtener la versión actual desde package.json
const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
let currentVersion = packageJson.version;

// Incrementar la versión según las reglas de SemVer
const versionParts = currentVersion.split('.');
let major = versionParts[0];
let minor = versionParts[1];
let patch = parseInt(versionParts[2]) + 1;
if (patch > 99) {
  patch = 0;
  minor = parseInt(minor) + 1;
}
if (minor > 99) {
  minor = 0;
  major = parseInt(major) + 1;
}
const newVersion = `${major}.${minor}.${patch}`;

// Actualizar la versión en package.json
packageJson.version = newVersion;
fs.writeFileSync('./package.json', JSON.stringify(packageJson, null, 2));

// Añadir los cambios al área de preparación de Git y realizar una confirmación con un mensaje automático
execSync(`git add package.json && git commit -m "Bump version to ${newVersion}"`);
