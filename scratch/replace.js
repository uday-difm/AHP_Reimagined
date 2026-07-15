const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'app', 'dashboard', 'settings', 'SettingsEditor.js');
let content = fs.readFileSync(filePath, 'utf8');
let lines = content.split('\n');

for(let i=594; i<820; i++) {
  lines[i] = lines[i].replace(/amber/g, 'slate').replace(/purple/g, 'slate');
}

fs.writeFileSync(filePath, lines.join('\n'));
console.log('Replaced amber and purple with slate in lines 595-820');
