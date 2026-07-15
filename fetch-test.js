const http = require('http');

http.get('http://localhost:3000/blogs/wadawdaw?_rsc=vNUWBOhPuT4wEKqL', (res) => {
  console.log('Status Code:', res.statusCode);
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('Response:', data);
    process.exit(0);
  });
}).on('error', (err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
