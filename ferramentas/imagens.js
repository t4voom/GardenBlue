// Otimiza as fotos de assets/img/originais/ para o site:
//   <nome>-480/-720/-960/-1600.webp → srcset (nunca amplia além do original)
//   <nome>.jpg (960px)                                     → fallback para navegadores sem WebP
//   og-image.jpg (1200×630)                                → prévia no WhatsApp/Facebook
//   favicon.ico, apple-touch-icon.png, ícones do manifest → a partir de favicon.svg
//
//   npm run imagens            (só reprocessa o que mudou)
//   npm run imagens -- --force (reprocessa tudo)

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const fotos = require('./fotos');

const RAIZ = path.join(__dirname, '..');
const ORIGINAIS = path.join(RAIZ, 'assets', 'img', 'originais');
const SAIDA = path.join(RAIZ, 'assets', 'img');
const ICONES = path.join(SAIDA, 'icones');
const LARGURAS = [480, 720, 960, 1600];
const EXTS = ['.jpg', '.jpeg', '.png', '.webp'];
const FORCAR = process.argv.includes('--force');

function kb(arquivo) { return Math.round(fs.statSync(arquivo).size / 1024) + ' KB'; }

function desatualizado(origem, destinos) {
  if (FORCAR) return true;
  const t = fs.statSync(origem).mtimeMs;
  return destinos.some((d) => !fs.existsSync(d) || fs.statSync(d).mtimeMs < t);
}

// Um arquivo por nome; se houver hero-flores.jpg e hero-flores.png, vale o mais recente.
function listarOriginais() {
  const porNome = {};
  for (const arq of fs.readdirSync(ORIGINAIS)) {
    const ext = path.extname(arq).toLowerCase();
    if (!EXTS.includes(ext)) continue;
    const nome = path.basename(arq, path.extname(arq)).toLowerCase();
    const caminho = path.join(ORIGINAIS, arq);
    const atual = porNome[nome];
    if (atual) console.warn(`  ! "${nome}" aparece mais de uma vez em originais/, usando o arquivo mais recente.`);
    if (!atual || fs.statSync(caminho).mtimeMs > fs.statSync(atual).mtimeMs) porNome[nome] = caminho;
  }
  return porNome;
}

async function otimizar(nome, origem) {
  const destinos = LARGURAS.map((w) => path.join(SAIDA, `${nome}-${w}.webp`)).concat(path.join(SAIDA, `${nome}.jpg`));
  if (!desatualizado(origem, destinos)) return false;
  const base = sharp(origem).rotate(); // respeita a orientação EXIF do celular
  for (const w of LARGURAS) {
    await base.clone().resize({ width: w, withoutEnlargement: true }).webp({ quality: 76 }).toFile(path.join(SAIDA, `${nome}-${w}.webp`));
  }
  await base.clone().resize({ width: 960, withoutEnlargement: true }).flatten({ background: '#FBF6EC' })
    .jpeg({ quality: 78, progressive: true }).toFile(path.join(SAIDA, `${nome}.jpg`));
  const meta = await sharp(origem).metadata();
  const aviso = meta.width < 1080 ? `  ⚠ só ${meta.width}px de largura, pode ficar borrada` : '';
  console.log(`  ✓ ${nome}  (${meta.width}×${meta.height}, 960w = ${kb(destinos[2])})${aviso}`);
  return true;
}

async function ogImage(originais) {
  const origem = originais['og-image'] || originais['hero-flores'];
  if (!origem) return;
  const destino = path.join(SAIDA, 'og-image.jpg');
  if (!desatualizado(origem, [destino])) return;
  await sharp(origem).rotate().resize(1200, 630, { fit: 'cover', position: sharp.strategy.attention })
    .jpeg({ quality: 82, progressive: true }).toFile(destino);
  console.log(`  ✓ og-image.jpg (1200×630, ${kb(destino)})`);
}

// .ico com PNGs embutidos (formato aceito por todos os navegadores atuais)
function montarIco(pngs) {
  const cab = Buffer.alloc(6 + 16 * pngs.length);
  cab.writeUInt16LE(0, 0); cab.writeUInt16LE(1, 2); cab.writeUInt16LE(pngs.length, 4);
  let offset = cab.length;
  pngs.forEach(({ tam, buf }, i) => {
    const o = 6 + 16 * i;
    cab.writeUInt8(tam >= 256 ? 0 : tam, o); cab.writeUInt8(tam >= 256 ? 0 : tam, o + 1);
    cab.writeUInt8(0, o + 2); cab.writeUInt8(0, o + 3);
    cab.writeUInt16LE(1, o + 4); cab.writeUInt16LE(32, o + 6);
    cab.writeUInt32LE(buf.length, o + 8); cab.writeUInt32LE(offset, o + 12);
    offset += buf.length;
  });
  return Buffer.concat([cab].concat(pngs.map((p) => p.buf)));
}

async function icones() {
  const svg = path.join(RAIZ, 'favicon.svg');
  const destinos = [path.join(RAIZ, 'favicon.ico'), path.join(RAIZ, 'apple-touch-icon.png'), path.join(ICONES, 'icone-192.png'), path.join(ICONES, 'icone-512.png'), path.join(ICONES, 'icone-maskable-512.png')];
  if (!fs.existsSync(svg) || !desatualizado(svg, destinos)) return;
  if (!fs.existsSync(ICONES)) fs.mkdirSync(ICONES, { recursive: true });
  const png = (tam) => sharp(svg, { density: Math.ceil((72 * tam) / 64) }).resize(tam, tam).png().toBuffer();

  fs.writeFileSync(destinos[0], montarIco([{ tam: 16, buf: await png(16) }, { tam: 32, buf: await png(32) }, { tam: 48, buf: await png(48) }]));
  // iOS e Android recortam o ícone, então ele vai sobre fundo creme com respiro
  const comFundo = async (tam, margem) => {
    const miolo = Math.round(tam * (1 - margem * 2));
    return sharp({ create: { width: tam, height: tam, channels: 4, background: '#FBF6EC' } })
      .composite([{ input: await png(miolo), gravity: 'center' }]).png();
  };
  await (await comFundo(180, 0.08)).toFile(destinos[1]);
  await sharp(await png(192)).toFile(destinos[2]);
  await sharp(await png(512)).toFile(destinos[3]);
  await (await comFundo(512, 0.14)).toFile(destinos[4]);
  console.log('  ✓ favicon.ico, apple-touch-icon.png e ícones do manifest');
}

(async () => {
  const originais = listarOriginais();
  let feitas = 0;
  for (const nome of Object.keys(originais).sort()) {
    if (nome === 'og-image') continue;
    if (await otimizar(nome, originais[nome])) feitas++;
  }
  await ogImage(originais);
  await icones();

  const faltando = fotos.filter((f) => !originais[f.nome]).map((f) => f.nome);
  console.log(`\n${feitas} foto(s) processada(s)${feitas ? '' : ' (nada mudou; use -- --force para refazer tudo)'}.`);
  if (faltando.length) console.log('Faltando em originais/: ' + faltando.join(', '));
})().catch((e) => { console.error(e); process.exit(1); });
