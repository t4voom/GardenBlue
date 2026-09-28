// Gera fotos provisórias (ilustrações) em assets/img/originais/ para o site funcionar
// enquanto as fotos reais não chegam. NUNCA sobrescreve um arquivo que já existe
// (use --force só se quiser recriar os provisórios de propósito).
//
//   npm run placeholders
//   npm run imagens          ← depois, para gerar as versões otimizadas

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const fotos = require('./fotos');

const PASTA = path.join(__dirname, '..', 'assets', 'img', 'originais');
const FORCAR = process.argv.includes('--force');
const EXTS = ['.jpg', '.jpeg', '.png', '.webp'];

const TONS = {
  quente: { fundo: ['#FCE3CC', '#F4A261'], flores: ['#F26A1B', '#FF9F43', '#D0283E', '#FFD166', '#FFF4E6'], miolo: '#7A2E0E' },
  rosa: { fundo: ['#FBE3E8', '#E98AA4'], flores: ['#D6336C', '#F783AC', '#FFFFFF', '#C2255C', '#FFC9D6'], miolo: '#FFD166' },
  lilas: { fundo: ['#F1E8F8', '#B28DDB'], flores: ['#8A5CC7', '#F783AC', '#FFFFFF', '#FFD166', '#6741A8'], miolo: '#FFE08A' },
  amarelo: { fundo: ['#FFF3CF', '#F4B942'], flores: ['#F2B705', '#FFC933', '#F59F00'], miolo: '#5A3A12' },
  verde: { fundo: ['#E3ECD9', '#5E8F57'], flores: ['#FFFFFF', '#F4F1E8'], miolo: '#F2C94C' },
  'verde-claro': { fundo: ['#F1F5E9', '#A9C99A'], flores: ['#FFFFFF', '#F26A1B', '#FFD166'], miolo: '#F2C94C' },
  grama: { fundo: ['#CFE6B8', '#3E7D3F'], flores: ['#FFFFFF'], miolo: '#F2C94C' },
  terracota: { fundo: ['#F8EADB', '#D98E63'], flores: ['#F26A1B', '#FFFFFF'], miolo: '#7A2E0E' },
  creme: { fundo: ['#FBF6EC', '#DCCBAE'], flores: ['#F26A1B', '#D0283E', '#FFFFFF'], miolo: '#7A2E0E' }
};
const VERDES = ['#1E4629', '#275C35', '#2F6E3F', '#3F7A45', '#5E8F57', '#7FAE6E', '#9DBF8E'];

// PRNG com semente fixa por nome → o mesmo arquivo sempre sai igual
function semente(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) { h = Math.imul(h ^ str.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
  let a = h >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function tamanho(prop) {
  const [w, h] = prop.split(':').map(Number);
  return w >= h ? { W: Math.round(1080 * w / h), H: 1080 } : { W: 1080, H: Math.round(1080 * h / w) };
}

const f = (n) => n.toFixed(1);

function folha(x, y, comp, larg, rot, cor, opac) {
  const c = comp, l = larg;
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(rot)})" opacity="${opac}">` +
    `<path d="M0 0 C${f(l)} ${f(-c * 0.25)} ${f(l)} ${f(-c * 0.7)} 0 ${f(-c)} C${f(-l)} ${f(-c * 0.7)} ${f(-l)} ${f(-c * 0.25)} 0 0Z" fill="${cor}"/>` +
    `<path d="M0 0 L0 ${f(-c * 0.92)}" stroke="#000" stroke-opacity=".12" stroke-width="${f(Math.max(2, l * 0.06))}" fill="none"/></g>`;
}

function flor(x, y, r, petalas, cor, miolo, rot) {
  let s = `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(rot)})">`;
  for (let i = 0; i < petalas; i++) {
    const ang = (360 / petalas) * i;
    s += `<ellipse cx="0" cy="${f(-r * 0.5)}" rx="${f(r * 0.34)}" ry="${f(r * 0.56)}" transform="rotate(${f(ang)})" fill="${cor}"/>`;
  }
  s += `<circle r="${f(r * 0.26)}" fill="${miolo}"/></g>`;
  return s;
}

function girassol(x, y, r, rnd) {
  let s = `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(rnd() * 30)})">`;
  const n = 20;
  for (let i = 0; i < n; i++) {
    const cor = i % 2 ? '#F2B705' : '#FFC933';
    s += `<ellipse cx="0" cy="${f(-r * 0.62)}" rx="${f(r * 0.14)}" ry="${f(r * 0.42)}" transform="rotate(${f((360 / n) * i)})" fill="${cor}"/>`;
  }
  s += `<circle r="${f(r * 0.4)}" fill="#5A3A12"/>`;
  for (let i = 0; i < 24; i++) {
    const a = rnd() * Math.PI * 2, d = rnd() * r * 0.34;
    s += `<circle cx="${f(Math.cos(a) * d)}" cy="${f(Math.sin(a) * d)}" r="${f(r * 0.03)}" fill="#3B240A"/>`;
  }
  return s + '</g>';
}

function vaso(x, base, larg, alt, cor) {
  const topo = base - alt;
  return `<g><path d="M${f(x - larg / 2)} ${f(topo)} L${f(x + larg / 2)} ${f(topo)} L${f(x + larg * 0.38)} ${f(base)} L${f(x - larg * 0.38)} ${f(base)}Z" fill="${cor}"/>` +
    `<rect x="${f(x - larg * 0.55)}" y="${f(topo - alt * 0.12)}" width="${f(larg * 1.1)}" height="${f(alt * 0.14)}" rx="${f(alt * 0.05)}" fill="${cor}"/>` +
    `<path d="M${f(x - larg * 0.46)} ${f(topo + alt * 0.35)} L${f(x + larg * 0.46)} ${f(topo + alt * 0.35)}" stroke="#fff" stroke-opacity=".35" stroke-width="${f(alt * 0.04)}"/></g>`;
}

function desenhar(foto, W, H, rnd) {
  const tom = TONS[foto.tom] || TONS.verde;
  const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
  const escala = Math.min(W, H) / 1080;
  let arte = '';

  if (foto.motivo === 'flores' || foto.motivo === 'girassol') {
    for (let i = 0; i < 14; i++) {
      arte += folha(rnd() * W, H * (0.35 + rnd() * 0.75), (280 + rnd() * 380) * escala, (70 + rnd() * 80) * escala, -70 + rnd() * 140, pick(VERDES), (0.55 + rnd() * 0.4).toFixed(2));
    }
    if (foto.motivo === 'girassol') {
      const n = 3 + Math.floor(rnd() * 2);
      for (let i = 0; i < n; i++) arte += girassol(W * (0.2 + rnd() * 0.6), H * (0.18 + rnd() * 0.55), (170 + rnd() * 120) * escala, rnd);
    } else {
      const n = 11 + Math.floor(rnd() * 6);
      for (let i = 0; i < n; i++) {
        const r = (90 + rnd() * 120) * escala;
        arte += flor(r + rnd() * (W - 2 * r), r + rnd() * (H * 0.85 - r), r, 5 + Math.floor(rnd() * 3), pick(tom.flores), tom.miolo, rnd() * 72);
      }
    }
  } else if (foto.motivo === 'folhagem') {
    const n = 13;
    for (let i = 0; i < n; i++) {
      const rot = -75 + (150 / (n - 1)) * i + (rnd() * 12 - 6);
      arte += folha(W * (0.42 + rnd() * 0.16), H * 1.02, (H * 0.55 + rnd() * H * 0.35), (90 + rnd() * 90) * escala, rot, pick(VERDES), (0.8 + rnd() * 0.2).toFixed(2));
    }
  } else if (foto.motivo === 'forracao') {
    for (let i = 0; i < 260; i++) {
      const y = H * 0.25 + rnd() * H * 0.8;
      arte += `<circle cx="${f(rnd() * W)}" cy="${f(y)}" r="${f((24 + rnd() * 46) * escala)}" fill="${pick(VERDES)}" opacity="${(0.75 + rnd() * 0.25).toFixed(2)}"/>`;
    }
    for (let i = 0; i < 70; i++) {
      arte += `<circle cx="${f(rnd() * W)}" cy="${f(H * 0.3 + rnd() * H * 0.7)}" r="${f((7 + rnd() * 7) * escala)}" fill="${pick(tom.flores)}"/>`;
    }
  } else if (foto.motivo === 'grama') {
    for (let i = 0; i < 420; i++) {
      const x = rnd() * W, alt = (140 + rnd() * 320) * escala, curva = (rnd() * 60 - 30) * escala;
      const y0 = H * (0.3 + rnd() * 0.75);
      arte += `<path d="M${f(x)} ${f(y0)} Q${f(x + curva)} ${f(y0 - alt * 0.6)} ${f(x + curva * 1.6)} ${f(y0 - alt)}" stroke="${pick(VERDES)}" stroke-width="${f((5 + rnd() * 7) * escala)}" stroke-linecap="round" fill="none" opacity="${(0.7 + rnd() * 0.3).toFixed(2)}"/>`;
    }
  } else if (foto.motivo === 'vasos') {
    const cores = ['#C8734B', '#F4F1E8', '#8E9A92', '#E0B48A', '#2F6E3F'];
    const n = W > H ? 4 : 3;
    for (let i = 0; i < n; i++) {
      const x = W * ((i + 0.5) / n), larg = (W / n) * (0.55 + rnd() * 0.2), alt = H * (0.2 + rnd() * 0.12);
      const topo = H * 0.92 - alt;
      for (let k = 0; k < 7; k++) arte += folha(x, topo, H * (0.22 + rnd() * 0.3), (40 + rnd() * 60) * escala, -60 + rnd() * 120, pick(VERDES), '0.95');
      arte += vaso(x, H * 0.92, larg, alt, pick(cores));
    }
    arte = `<rect x="0" y="${f(H * 0.9)}" width="${W}" height="${f(H * 0.1)}" fill="#000" opacity=".08"/>` + arte;
  } else if (foto.motivo === 'jardim' || foto.motivo === 'loja') {
    arte += `<path d="M0 ${f(H * 0.55)} C${f(W * 0.3)} ${f(H * 0.45)} ${f(W * 0.6)} ${f(H * 0.62)} ${W} ${f(H * 0.5)} L${W} ${H} L0 ${H}Z" fill="#7FAE6E"/>`;
    arte += `<path d="M0 ${f(H * 0.7)} C${f(W * 0.35)} ${f(H * 0.62)} ${f(W * 0.7)} ${f(H * 0.78)} ${W} ${f(H * 0.66)} L${W} ${H} L0 ${H}Z" fill="#5E8F57"/>`;
    arte += `<path d="M${f(W * 0.46)} ${H} C${f(W * 0.5)} ${f(H * 0.85)} ${f(W * 0.62)} ${f(H * 0.75)} ${f(W * 0.58)} ${f(H * 0.62)} L${f(W * 0.64)} ${f(H * 0.62)} C${f(W * 0.7)} ${f(H * 0.76)} ${f(W * 0.62)} ${f(H * 0.88)} ${f(W * 0.62)} ${H}Z" fill="#F3EBDC" opacity=".85"/>`;
    if (foto.motivo === 'loja') {
      const bx = W * 0.18, bw = W * 0.64, by = H * 0.3, bh = H * 0.3;
      arte += `<rect x="${f(bx)}" y="${f(by)}" width="${f(bw)}" height="${f(bh)}" fill="#F4F1E8"/>`;
      arte += `<path d="M${f(bx - W * 0.03)} ${f(by)} L${f(bx + bw / 2)} ${f(by - H * 0.1)} L${f(bx + bw + W * 0.03)} ${f(by)}Z" fill="#8E4A2C"/>`;
      arte += `<rect x="${f(W * 0.36)}" y="${f(by + bh * 0.18)}" width="${f(W * 0.28)}" height="${f(bh * 0.28)}" rx="8" fill="#F26A1B"/>`;
      arte += `<rect x="${f(W * 0.39)}" y="${f(by + bh * 0.24)}" width="${f(W * 0.22)}" height="${f(bh * 0.16)}" rx="6" fill="#FFFFFF"/>`;
      for (let i = 0; i < 9; i++) arte += `<rect x="${f(bx + (bw / 9) * i + 6)}" y="${f(by + bh * 0.62)}" width="${f(bw / 9 - 12)}" height="${f(bh * 0.38)}" fill="#DCCBAE"/>`;
    }
    for (let i = 0; i < 22; i++) {
      const x = rnd() * W, y = H * (0.55 + rnd() * 0.4), r = (40 + rnd() * 90) * escala;
      arte += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${pick(VERDES)}"/>`;
      if (rnd() > 0.5) arte += `<circle cx="${f(x + r * 0.3)}" cy="${f(y - r * 0.3)}" r="${f(r * 0.18)}" fill="${pick(['#F26A1B', '#FFFFFF', '#D0283E', '#FFD166'])}"/>`;
    }
    for (let i = 0; i < 6; i++) arte += folha(rnd() * W, H * 0.62, H * (0.25 + rnd() * 0.2), (40 + rnd() * 50) * escala, -40 + rnd() * 80, pick(VERDES), '0.9');
  }

  const fs1 = Math.round(30 * escala), fs2 = Math.round(19 * escala);
  const rotulo = `${foto.nome}.jpg  ·  ${foto.prop}`;
  const larguraRotulo = Math.round(rotulo.length * fs1 * 0.56 + 64 * escala);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${tom.fundo[0]}"/><stop offset="1" stop-color="${tom.fundo[1]}"/></linearGradient>
    <radialGradient id="v" cx=".5" cy=".45" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#0F2417" stop-opacity=".35"/></radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  ${arte}
  <rect width="${W}" height="${H}" fill="url(#v)"/>
  <g transform="translate(${Math.round(40 * escala)} ${H - Math.round(118 * escala)})" font-family="Segoe UI, Arial, sans-serif">
    <rect width="${larguraRotulo}" height="${Math.round(84 * escala)}" rx="${Math.round(42 * escala)}" fill="#0F2417" fill-opacity=".78"/>
    <text x="${Math.round(32 * escala)}" y="${Math.round(30 * escala)}" font-size="${fs2}" fill="#F26A1B" font-weight="700" letter-spacing="2">FOTO PROVISÓRIA</text>
    <text x="${Math.round(32 * escala)}" y="${Math.round(64 * escala)}" font-size="${fs1}" fill="#FFFDF8" font-weight="600">${rotulo}</text>
  </g>
</svg>`;
}

function existente(nome) {
  return EXTS.map((e) => path.join(PASTA, nome + e)).find((p) => fs.existsSync(p));
}

(async () => {
  if (!fs.existsSync(PASTA)) fs.mkdirSync(PASTA, { recursive: true });
  let criadas = 0, puladas = 0;
  for (const foto of fotos) {
    const atual = existente(foto.nome);
    if (atual && !FORCAR) { puladas++; continue; }
    const { W, H } = tamanho(foto.prop);
    const svg = desenhar(foto, W, H, semente(foto.nome));
    await sharp(Buffer.from(svg)).jpeg({ quality: 88 }).toFile(path.join(PASTA, foto.nome + '.jpg'));
    criadas++;
    console.log('  ✓ ' + foto.nome + '.jpg (' + W + '×' + H + ')');
  }
  console.log(`\nPlaceholders: ${criadas} criado(s), ${puladas} já existia(m) e foram mantidos.`);
})().catch((e) => { console.error(e); process.exit(1); });
