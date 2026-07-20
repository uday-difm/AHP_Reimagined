const lucide = require('lucide-react');
const findKeys = (query) => {
  return Object.keys(lucide).filter(k => k.toLowerCase().includes(query.toLowerCase()));
};

console.log('F keys starting with Face:', findKeys('face'));
console.log('I keys starting with Ins:', findKeys('ins'));
console.log('T keys starting with Twi:', findKeys('twi'));
console.log('Y keys starting with You:', findKeys('you'));
console.log('L keys starting with Lin:', findKeys('lin'));
