const fs = require('fs');
const lines = fs.readFileSync('C:\\Users\\Divya Joshi\\.gemini\\antigravity-ide\\brain\\c059c691-dd84-40f2-9a0e-5de019d2e3d1\\.system_generated\\logs\\transcript_full.jsonl', 'utf8').split('\n');

let allContent = '';
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('replace_file_content') && lines[i].includes('dashboard') && lines[i].includes('page.js')) {
    try {
      const data = JSON.parse(lines[i]);
      if (data.tool_calls) {
        for (const tc of data.tool_calls) {
          if (tc.name === 'multi_replace_file_content' || tc.name === 'replace_file_content') {
            const args = tc.args;
            if (args.TargetFile && args.TargetFile.includes('dashboard') && args.TargetFile.includes('page.js')) {
              allContent += `\n// Tool call at line ${i}\n` + JSON.stringify(args, null, 2);
            }
          }
        }
      }
    } catch(e) {}
  }
}
fs.writeFileSync('C:\\Users\\Divya Joshi\\Desktop\\learning\\AHP\\AHP_Reimagined\\scratch\\tool_calls.txt', allContent);
