// scripts/updateVersion.js

const fs = require('fs');
const { execSync } = require('child_process');

// Obtener la versión actual desde package.json
const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));


const [,, strategy] = process.argv;
let [ major, minor, patch ] = packageJson.version.split('.').map(Number)

patch += (strategy.toLowerCase() === 'minor') ? (100 - patch) : ((strategy.toLowerCase() === 'revision') ? 0 : 1);
// Ajustar las partes de la versión si es necesario
minor += Math.floor(patch / 100);
major += Math.floor(minor / 100);

packageJson.version = `${major}.${minor % 100}.${patch % 100}`;
packageJson.revision = new Date().toISOString().slice(0, 16).replace(/(-|:)/ig,"").replace(/t/i,".")
// Actualizar la versión en package.json
fs.writeFileSync('./package.json', JSON.stringify(packageJson, null, 2));
// Añadir los cambios al área de preparación de Git y realizar una confirmación con un mensaje automático
execSync(`git add package.json && git commit -m "Bump version to ${packageJson.version}-${packageJson.revision}"`);

console.log('La versión se ha actualizado correctamente.');
console.log('Nueva versión:', packageJson.version);
console.log('Revisión:', packageJson.revision);