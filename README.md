# Garden Blue Ornamental: site one-page

Site institucional da **Garden Blue Ornamental** (Flora e Paisagismo, Gaspar/SC), feito em HTML, CSS e JavaScript puros. Não tem build nem backend: a pasta inteira já é o site.

```
index.html              página única (SEO, Open Graph e JSON-LD no <head>)
css/styles.css          estilos (paleta e fontes em :root, no topo do arquivo)
js/main.js              WhatsApp, "aberto agora", menu, animações e lightbox (CONFIG no topo)
assets/img/             imagens otimizadas que o site usa (geradas, não edite à mão)
assets/img/originais/   SUAS fotos vão aqui (hoje estão ilustrações provisórias)
ferramentas/            scripts locais (servidor, otimização de imagens, troca de domínio)
```

## Rodar localmente

Funciona com qualquer versão do Node:

```bash
npm start
```

Depois é só abrir http://localhost:5173. Dá também para abrir o `index.html` direto no navegador.

## Publicar no GitHub Pages

O `index.html` fica na raiz do repositório e todos os caminhos são relativos, então o site funciona em `https://usuario.github.io/nome-do-repo/`. O arquivo `.nojekyll` faz o GitHub servir os arquivos como estão, sem processar com o Jekyll.

1. Envie o projeto com Git. O upload pelo site do GitHub aceita no máximo 100 arquivos por vez, e este projeto tem cerca de 150.
   ```bash
   git remote add origin https://github.com/SEU-USUARIO/garden-blue.git
   git push -u origin main
   ```
2. No repositório, abra **Settings → Pages** e escolha **Source: Deploy from a branch**, **Branch: `main`**, pasta **`/ (root)`**. Depois clique em **Save**.
3. Em 1 ou 2 minutos o site sai em `https://SEU-USUARIO.github.io/garden-blue/`. Com esse endereço, rode o comando abaixo, faça um commit e dê push de novo:

```bash
npm run dominio -- https://SEU-USUARIO.github.io/garden-blue
```

Ele atualiza o canonical, o Open Graph (a prévia no WhatsApp precisa de URL absoluta), o JSON-LD, o `robots.txt` e o `sitemap.xml`. Se depois houver um domínio próprio, basta rodar de novo com ele.

O site também funciona sem mudanças na Vercel ou na Netlify (build vazio, pasta raiz).

## Trocar as fotos

1. Instale o otimizador (só na primeira vez): `npm run setup`
2. Coloque as fotos em `assets/img/originais/` **com os nomes da tabela**, substituindo as provisórias. Pode ser `.jpg`, `.png` ou `.webp`.
3. Rode `npm run imagens`. Ele gera as versões WebP em 480, 720, 960 e 1600 px, o JPG de reserva e a `og-image.jpg`.

O site recorta as fotos com `object-fit: cover`, então a proporção não precisa ser exata. Deixe o assunto principal no centro. As fotos do Instagram (1080 px de largura) já servem. Se alguma tiver menos de 1080 px, o script avisa.

| Arquivo | Proporção | Onde aparece | O que funciona bem |
|---|---|---|---|
| `hero-flores` | 4:5 vertical | Topo do site (1ª tela do celular) | A foto mais bonita e colorida do perfil, cheia de flores e bem iluminada |
| `flores-de-epoca` | 3:4 | Card "Flores de época" | Bandejas de petúnias ou outras flores da estação |
| `plantas-de-interior` | 3:4 | Card "Plantas de interior" | Zamioculca, lírio-da-paz, jiboia ou yucca em vaso |
| `forracoes` | 3:4 | Card "Forrações" | Bandejas de forração ou canteiro plantado |
| `grama-esmeralda` | 3:4 | Card "Grama esmeralda" | Placas empilhadas ou gramado recém-plantado |
| `vasos-e-cachepos` | 3:4 | Card "Vasos e cachepôs" | Vasos de cerâmica e cachepôs lado a lado |
| `petunias` | 4:5 | Primavera | Petúnias em close |
| `kalanchoes` | 4:5 | Primavera | Kalanchoes nos vasos de cerâmica |
| `girassois` | 4:5 | Primavera + círculo do hero | Girassóis com a flor no centro |
| `flores-da-primavera` | 4:5 | Primavera | Qualquer foto do destaque "Primavera" |
| `paisagismo-jardim` | 4:5 | Paisagismo (foto grande) | Um jardim feito por eles, pronto |
| `paisagismo-detalhe` | 1:1 | Paisagismo (círculo) | Detalhe de canteiro ou grama recém-colocada |
| `galeria-buque-girassois` | 1:1 | Galeria (bloco grande) | A melhor foto do perfil |
| `galeria-vasos-yucca` | 2:3 bem vertical | Galeria (bloco alto) | Yucca ou palmeira em vaso grande (frame de reels serve) |
| `galeria-zamioculca-lirio` | 1:1 | Galeria | Zamioculca, lírio-da-paz e jiboia |
| `galeria-kalanchoes-ceramica` | 1:1 | Galeria | Kalanchoes em cerâmica |
| `galeria-petunias-bancada` | 1:1 | Galeria | Petúnias nas bancadas |
| `galeria-folhagens` | 1:1 | Galeria | Folhagens |
| `galeria-forracao-canteiro` | 1:1 | Galeria | Canteiro com forração |
| `galeria-loja` | 1:1 | Galeria | O ambiente da loja |
| `loja-fachada` | 4:3 horizontal | Visite a loja | Fachada ou portão com o letreiro (a foto do Google Maps serve) |
| `og-image` *(opcional)* | 1200×630 | Prévia ao compartilhar o link | Se não tiver, o script recorta a `hero-flores` |

Se trocar a foto de alguma galeria ou card por outra com conteúdo diferente, atualize o `alt` e a legenda (`data-legenda`) no `index.html`.

## Onde editar

- **Número do WhatsApp e horários (lógica do "aberto agora"):** o objeto `CONFIG` no topo de `js/main.js`. O cálculo usa o fuso de Brasília e não considera feriados.
- **Horários (texto visível):** `index.html`, na seção `#visite` (lista `.horarios`) e no rodapé. Para o Google, no JSON-LD (`openingHoursSpecification`) do `<head>`.
- **Destaque da estação:** a seção `#estacao` do `index.html`. A palavra gigante do fundo fica no atributo `data-texto="Primavera"`.
- **Cores e fontes:** as variáveis em `:root` no topo de `css/styles.css`.

## Pendências ([CONFIRMAR])

- **Horário de sábado:** aparece como `[CONFIRMAR HORÁRIO]` no site, e o "aberto agora" mostra "a confirmar" aos sábados. Pela bio do Instagram, abre às 08h.
- **Domingo:** está `[CONFIRMAR]`, porque não constava nos dados. Se for fechado, use `0: []` no CONFIG e troque o texto.
- **Número e CEP no endereço:** o Google Maps mostra "R. Me. Paulina, **111**, Sete de Setembro, **89114-442**". O site exibe só o que foi passado. O mapa e o "Traçar rota" já usam o endereço do Google, para o pin cair no lugar certo. Com a confirmação, vale colocar o número e o CEP no texto e no JSON-LD (`streetAddress`/`postalCode`), porque isso ajuda no SEO local.
- **Domínio:** hoje é `SEU-DOMINIO.com.br`. Troque com `npm run dominio` depois de publicar.
- **Logo:** o selo (tulipa no círculo laranja) e o letreiro "Garden Blue" foram redesenhados em SVG/CSS a partir do perfil. Se o dono tiver o arquivo original em vetor, dá para trocar o `favicon.svg` e rodar `npm run imagens` para regenerar os ícones.

## Observações técnicas

- O otimizador usa `sharp` 0.25.4 porque é a versão que roda no Node 11 desta máquina. Se atualizar o Node (18 ou mais), pode usar a versão atual: `npm --prefix ferramentas i -D sharp@latest`.
- `npm run placeholders` recria as ilustrações provisórias, mas **nunca sobrescreve** uma foto que já esteja em `originais/`.
- Resultado do Lighthouse 6.4 medido localmente, com as imagens provisórias:
  - celular: Performance 99, Acessibilidade 100, Boas práticas 100, SEO 93;
  - desktop: 99, 100, 100 e 92.

  O SEO perde pontos só pelo canonical provisório; com o domínio configurado, deu 100. Os avisos de compressão e HTTP/2 somem no GitHub Pages, na Vercel ou na Netlify. Com as fotos reais, que pesam mais, vale medir de novo no PageSpeed Insights depois de publicar.
