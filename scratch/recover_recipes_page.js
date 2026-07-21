const fs = require('fs');

const logPath = 'C:\\Users\\Divya Joshi\\.gemini\\antigravity-ide\\brain\\c059c691-dd84-40f2-9a0e-5de019d2e3d1\\.system_generated\\logs\\transcript_full.jsonl';
const lines = fs.readFileSync(logPath, 'utf8').split('\n');

let extractedContent = '';

for (const line of lines) {
  if (!line) continue;
  try {
    const data = JSON.parse(line);
    if (data.type === 'VIEW_FILE' && data.content && data.content.includes('Total Lines: 729') && data.content.includes('recipes/page.js')) {
      // Find the "Showing lines" part
      const contentLines = data.content.split('\n');
      for (const cLine of contentLines) {
        if (/^\d+:\s(.*)/.test(cLine)) {
          const match = cLine.match(/^\d+:\s(.*)/);
          if (match) {
            extractedContent += match[1] + '\n';
          }
        }
      }
    }
  } catch (e) {}
}

fs.writeFileSync('c:\\Users\\Divya Joshi\\Desktop\\learning\\AHP\\AHP_Reimagined\\scratch\\recovered.js', extractedContent);
console.log('Recovery attempted.');
