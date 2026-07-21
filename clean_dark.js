const fs = require('fs');
const path = require('path');
const p = path.resolve('src/app/recipes/submit/page.js');
let c = fs.readFileSync(p, 'utf8');
c = c.replace(/dark:[^\s"'\>]+/g, '');
// Let's not remove all newlines by replacing spaces, it will ruin the code!
fs.writeFileSync(p, c);
console.log("Done");
