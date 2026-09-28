// Troca o domínio do site (canonical, Open Graph, JSON-LD, robots.txt e sitemap.xml) de uma vez.
//   npm run dominio -- https://usuario.github.io/garden-blue   (GitHub Pages)
//   npm run dominio -- https://gardenblue.com.br              (domínio próprio)
// Pode rodar de novo quando o endereço mudar.

const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
const ARQUIVOS = ['index.html', 'robots.txt', 'sitemap.xml'];
const novo = (process.argv[2] || '').replace(/\/+$/, '');

if (!/^https?:\/\/[^/\s]+(\/\S*)?$/.test(novo)) {
  console.error('Uso: npm run dominio -- https://usuario.github.io/garden-blue   (ou um domínio próprio)');
  process.exit(1);
}

const html = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');
const canonical = html.match(/<link rel="canonical" href="([^"]+)"/);
if (!canonical) { console.error('Não achei o <link rel="canonical"> no index.html.'); process.exit(1); }
const antigo = canonical[1].replace(/\/+$/, '');

for (const nome of ARQUIVOS) {
  const arq = path.join(RAIZ, nome);
  const texto = fs.readFileSync(arq, 'utf8');
  const vezes = texto.split(antigo).length - 1;
  fs.writeFileSync(arq, texto.split(antigo).join(novo));
  console.log(`  ${nome}: ${vezes} troca(s)`);
}
console.log(`\nDomínio: ${antigo} → ${novo}`);
