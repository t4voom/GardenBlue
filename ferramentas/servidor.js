// Servidor estático mínimo para ver o site localmente (sem dependências).
//   npm start            → http://localhost:5173
//   PORT=8080 npm start  → outra porta

const http = require('http');
const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
const PORTA = Number(process.env.PORT) || 5173;
const TIPOS = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon',
  '.woff2': 'font/woff2'
};

http.createServer((req, res) => {
  let rota = decodeURIComponent(req.url.split('?')[0]);
  if (rota.endsWith('/')) rota += 'index.html';
  const arquivo = path.normalize(path.join(RAIZ, rota));
  if (!arquivo.startsWith(RAIZ) || arquivo.includes(path.sep + 'ferramentas' + path.sep)) { res.writeHead(403); return res.end(); }
  fs.readFile(arquivo, (erro, dados) => {
    if (erro) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); return res.end('404 — não encontrado: ' + rota); }
    res.writeHead(200, { 'Content-Type': TIPOS[path.extname(arquivo).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(dados);
  });
}).listen(PORTA, () => console.log(`Garden Blue rodando em http://localhost:${PORTA}  (Ctrl+C para parar)`));
