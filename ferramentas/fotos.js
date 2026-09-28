// Lista única das fotos que o site usa.
// O script de placeholders e o de otimização leem daqui, e a tabela do README segue esta ordem.
//   nome   → nome do arquivo em assets/img/originais/ (sem extensão; .jpg, .jpeg, .png ou .webp)
//   prop   → proporção ideal (largura:altura). O site recorta com object-fit, então não precisa ser exata.
//   motivo → só para desenhar o placeholder.

module.exports = [
  { nome: 'hero-flores', prop: '4:5', motivo: 'flores', tom: 'quente', onde: 'Hero (topo do site)', dica: 'Vertical, cheia de flores coloridas e bem iluminada. É a primeira coisa que aparece no celular.' },

  { nome: 'flores-de-epoca', prop: '3:4', motivo: 'flores', tom: 'rosa', onde: 'Card "Flores de época"', dica: 'Bandejas de petúnias ou outras flores da estação.' },
  { nome: 'plantas-de-interior', prop: '3:4', motivo: 'folhagem', tom: 'verde', onde: 'Card "Plantas de interior"', dica: 'Zamioculca, lírio-da-paz, jiboia ou yucca em vaso.' },
  { nome: 'forracoes', prop: '3:4', motivo: 'forracao', tom: 'verde-claro', onde: 'Card "Forrações"', dica: 'Bandejas de forração ou um canteiro já plantado.' },
  { nome: 'grama-esmeralda', prop: '3:4', motivo: 'grama', tom: 'grama', onde: 'Card "Grama esmeralda"', dica: 'Placas de grama empilhadas ou um gramado recém-plantado.' },
  { nome: 'vasos-e-cachepos', prop: '3:4', motivo: 'vasos', tom: 'terracota', onde: 'Card "Vasos e cachepôs"', dica: 'Vasos de cerâmica e cachepôs decorados, de preferência lado a lado.' },

  { nome: 'petunias', prop: '4:5', motivo: 'flores', tom: 'rosa', onde: 'Primavera (galeria)', dica: 'Petúnias em close.' },
  { nome: 'kalanchoes', prop: '4:5', motivo: 'flores', tom: 'quente', onde: 'Primavera (galeria)', dica: 'Kalanchoes nos vasos de cerâmica.' },
  { nome: 'girassois', prop: '4:5', motivo: 'girassol', tom: 'amarelo', onde: 'Primavera (galeria) + círculo do hero', dica: 'Buquê ou vaso de girassóis, com a flor no centro da foto.' },
  { nome: 'flores-da-primavera', prop: '4:5', motivo: 'flores', tom: 'lilas', onde: 'Primavera (galeria)', dica: 'Qualquer foto do destaque "Primavera" do Instagram.' },

  { nome: 'paisagismo-jardim', prop: '4:5', motivo: 'jardim', tom: 'verde', onde: 'Paisagismo (foto principal)', dica: 'Um jardim feito por eles, de preferência pronto e bem cuidado.' },
  { nome: 'paisagismo-detalhe', prop: '1:1', motivo: 'folhagem', tom: 'verde-claro', onde: 'Paisagismo (foto pequena)', dica: 'Detalhe de canteiro, forração ou grama recém-colocada.' },

  { nome: 'galeria-buque-girassois', prop: '1:1', motivo: 'girassol', tom: 'amarelo', onde: 'Galeria (destaque grande)', dica: 'A melhor foto do perfil: vai ocupar o bloco maior.' },
  { nome: 'galeria-vasos-yucca', prop: '2:3', motivo: 'vasos', tom: 'creme', onde: 'Galeria (bloco alto)', dica: 'Bem vertical (frame de reels/story serve): yucca ou palmeira em vaso grande.' },
  { nome: 'galeria-zamioculca-lirio', prop: '1:1', motivo: 'folhagem', tom: 'verde', onde: 'Galeria', dica: 'Zamioculca, lírio-da-paz e jiboia.' },
  { nome: 'galeria-kalanchoes-ceramica', prop: '1:1', motivo: 'flores', tom: 'quente', onde: 'Galeria', dica: 'Kalanchoes em vasos de cerâmica.' },
  { nome: 'galeria-petunias-bancada', prop: '1:1', motivo: 'flores', tom: 'rosa', onde: 'Galeria', dica: 'Petúnias nas bancadas da loja.' },
  { nome: 'galeria-folhagens', prop: '1:1', motivo: 'folhagem', tom: 'verde-claro', onde: 'Galeria', dica: 'Folhagens ou plantas de interior.' },
  { nome: 'galeria-forracao-canteiro', prop: '1:1', motivo: 'forracao', tom: 'grama', onde: 'Galeria', dica: 'Canteiro com forração.' },
  { nome: 'galeria-loja', prop: '1:1', motivo: 'loja', tom: 'creme', onde: 'Galeria', dica: 'O ambiente da loja, com as plantas expostas.' },

  { nome: 'loja-fachada', prop: '4:3', motivo: 'loja', tom: 'verde', onde: 'Visite a loja', dica: 'Fachada ou portão com o letreiro, para o cliente reconhecer o lugar (pode ser a foto do Google Maps).' }
];
