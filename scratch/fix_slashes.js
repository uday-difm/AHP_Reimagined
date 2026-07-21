const fs = require('fs');

const file = "c:\\Users\\Divya Joshi\\Desktop\\learning\\AHP\\AHP_Reimagined\\src\\app\\recipes\\submit\\page.js";
let content = fs.readFileSync(file, 'utf8');

// The file was written with backslashes before backticks and dollar signs: \` and \$
// We want to replace \` with ` and \$ with $
content = content.replace(/\\`/g, '`').replace(/\\\$/g, '$');

fs.writeFileSync(file, content);
console.log("Fixed backslashes!");
