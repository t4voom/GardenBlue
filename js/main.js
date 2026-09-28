/* Garden Blue Ornamental — interações do site (sem dependências) */
(function () {
  'use strict';

  /* ------------------------------------------------------------------
     CONFIGURAÇÃO — o que muda com mais frequência fica aqui em cima
     ------------------------------------------------------------------ */
  var CONFIG = {
    // Número do WhatsApp (só dígitos, com 55 + DDD). É o mesmo para onde o link
    // wa.me/message/IT5ONCTSUASCB1 aponta. Com ele, cada botão abre a conversa
    // com uma mensagem pronta. Se ficar vazio, todos os botões usam o link curto.
    whatsappNumero: '554733970044',
    whatsappLinkCurto: 'https://wa.me/message/IT5ONCTSUASCB1',

    // Horários no fuso de Brasília. 0 = domingo … 6 = sábado.
    //   []   → fechado o dia todo
    //   null → ainda não confirmado (o site mostra "a confirmar")
    horarios: {
      0: null,                                     // Domingo  [CONFIRMAR]
      1: [['08:00', '12:00'], ['13:30', '17:30']],
      2: [['08:00', '12:00'], ['13:30', '17:30']],
      3: [['08:00', '12:00'], ['13:30', '17:30']],
      4: [['08:00', '12:00'], ['13:30', '17:30']],
      5: [['08:00', '12:00'], ['13:30', '17:30']],
      6: null                                      // Sábado   [CONFIRMAR HORÁRIO]
    }
  };

  var DIAS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
  var reduzMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- WhatsApp com mensagem pré-preenchida ---------- */
  function linkWhatsApp(mensagem) {
    if (!CONFIG.whatsappNumero) return CONFIG.whatsappLinkCurto;
    return 'https://wa.me/' + CONFIG.whatsappNumero + (mensagem ? '?text=' + encodeURIComponent(mensagem) : '');
  }
  document.querySelectorAll('[data-wa]').forEach(function (a) {
    a.href = linkWhatsApp(a.getAttribute('data-wa'));
  });

  /* ---------- Aberto agora? (fuso America/Sao_Paulo) ---------- */
  function paraMinutos(hhmm) { var p = hhmm.split(':'); return +p[0] * 60 + +p[1]; }
  function formatarHora(min) {
    var h = Math.floor(min / 60), m = min % 60;
    return h + 'h' + (m ? String(m).padStart(2, '0') : '');
  }

  function agoraEmBrasilia() {
    try {
      var partes = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Sao_Paulo', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
      }).formatToParts(new Date());
      var v = {};
      partes.forEach(function (p) { v[p.type] = p.value; });
      return { dia: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(v.weekday), min: (+v.hour % 24) * 60 + +v.minute };
    } catch (e) {
      // Navegador sem suporte a fuso: Brasília é UTC−3 o ano todo (sem horário de verão desde 2019)
      var d = new Date(Date.now() - 3 * 3600 * 1000);
      return { dia: d.getUTCDay(), min: d.getUTCHours() * 60 + d.getUTCMinutes() };
    }
  }

  function calcularStatus() {
    var agora = agoraEmBrasilia();
    var hoje = CONFIG.horarios[agora.dia];

    if (hoje === null) {
      return { estado: 'indefinido', texto: 'Horário de ' + DIAS[agora.dia] + ' a confirmar', dia: agora.dia };
    }
    var faixas = hoje.map(function (f) { return [paraMinutos(f[0]), paraMinutos(f[1])]; });
    for (var i = 0; i < faixas.length; i++) {
      if (agora.min >= faixas[i][0] && agora.min < faixas[i][1]) {
        return { estado: 'aberto', texto: 'Aberto agora · fecha às ' + formatarHora(faixas[i][1]), dia: agora.dia };
      }
    }
    var proxima = faixas.filter(function (f) { return f[0] > agora.min; })[0];
    if (proxima) {
      var jaAbriu = faixas.some(function (f) { return f[1] <= agora.min; });
      return { estado: 'fechado', texto: (jaAbriu ? 'Pausa para o almoço · volta às ' : 'Fechado agora · abre às ') + formatarHora(proxima[0]), dia: agora.dia };
    }
    for (var n = 1; n <= 7; n++) {
      var d = (agora.dia + n) % 7;
      var h = CONFIG.horarios[d];
      if (h === null) return { estado: 'fechado', texto: 'Fechado agora · horário de ' + DIAS[d] + ' a confirmar', dia: agora.dia };
      if (h.length) {
        var quando = n === 1 ? 'amanhã' : DIAS[d];
        return { estado: 'fechado', texto: 'Fechado agora · abre ' + quando + ' às ' + formatarHora(paraMinutos(h[0][0])), dia: agora.dia };
      }
    }
    return { estado: 'fechado', texto: 'Fechado agora', dia: agora.dia };
  }

  function atualizarStatus() {
    var s = calcularStatus();
    document.querySelectorAll('[data-status]').forEach(function (el) {
      el.setAttribute('data-estado', s.estado);
      el.querySelector('[data-status-texto]').textContent = s.texto;
      el.hidden = false;
    });
    document.querySelectorAll('[data-dias]').forEach(function (linha) {
      var dias = linha.getAttribute('data-dias').split(',').map(Number);
      linha.classList.toggle('is-hoje', dias.indexOf(s.dia) !== -1);
    });
  }
  atualizarStatus();
  setInterval(atualizarStatus, 60 * 1000);

  /* ---------- Cabeçalho: sombra ao rolar + menu do celular ---------- */
  var topo = document.querySelector('[data-topo]');
  var menu = document.querySelector('[data-menu]');
  var botaoMenu = document.querySelector('[data-menu-btn]');

  function alternarMenu(abrir) {
    menu.classList.toggle('is-aberto', abrir);
    botaoMenu.setAttribute('aria-expanded', String(abrir));
    botaoMenu.querySelector('.sr').textContent = abrir ? 'Fechar menu' : 'Abrir menu';
  }
  botaoMenu.addEventListener('click', function () {
    alternarMenu(botaoMenu.getAttribute('aria-expanded') !== 'true');
  });
  menu.addEventListener('click', function (e) {
    if (e.target.closest('a')) alternarMenu(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menu.classList.contains('is-aberto')) { alternarMenu(false); botaoMenu.focus(); }
  });
  document.addEventListener('click', function (e) {
    if (menu.classList.contains('is-aberto') && !topo.contains(e.target)) alternarMenu(false);
  });

  /* ---------- Rolagem: cabeçalho + parallax suave ---------- */
  var alvosParallax = reduzMovimento ? [] : Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));
  var agendado = false;

  function aoRolar() {
    var y = window.scrollY;
    topo.classList.toggle('is-rolado', y > 8);
    if (y < window.innerHeight * 1.3) {
      alvosParallax.forEach(function (el) {
        var limite = el.parentElement.offsetHeight * 0.08;
        var desloc = Math.max(-limite, Math.min(limite, y * parseFloat(el.getAttribute('data-parallax'))));
        el.style.transform = 'translate3d(0,' + desloc.toFixed(1) + 'px,0)';
      });
    }
    agendado = false;
  }
  window.addEventListener('scroll', function () {
    if (!agendado) { agendado = true; requestAnimationFrame(aoRolar); }
  }, { passive: true });
  aoRolar();

  /* ---------- Revelar elementos ao entrar na tela ---------- */
  var revelar = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !reduzMovimento) {
    var observador = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (entrada.isIntersecting) {
          entrada.target.classList.add('is-visivel');
          observador.unobserve(entrada.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    revelar.forEach(function (el) { observador.observe(el); });
  } else {
    revelar.forEach(function (el) { el.classList.add('is-visivel'); });
  }

  /* ---------- Lightbox da galeria ---------- */
  var dialogo = document.querySelector('[data-lightbox-dialog]');
  var itens = Array.prototype.slice.call(document.querySelectorAll('[data-lightbox]'));

  if (dialogo && typeof dialogo.showModal === 'function' && itens.length) {
    var foto = dialogo.querySelector('[data-lightbox-img]');
    var legenda = dialogo.querySelector('[data-lightbox-legenda]');
    var contador = dialogo.querySelector('[data-lightbox-contador]');
    var atual = 0;

    var mostrar = function (i) {
      atual = (i + itens.length) % itens.length;
      var link = itens[atual];
      foto.src = link.getAttribute('href');
      foto.alt = link.querySelector('img').alt;
      legenda.textContent = link.getAttribute('data-legenda') || '';
      contador.textContent = (atual + 1) + ' / ' + itens.length;
      new Image().src = itens[(atual + 1) % itens.length].getAttribute('href'); // pré-carrega a próxima
      if (!dialogo.open) dialogo.showModal(); // a rolagem da página trava via CSS (html:has(dialog[open]))
    };

    itens.forEach(function (link, i) {
      link.addEventListener('click', function (e) { e.preventDefault(); mostrar(i); });
    });
    dialogo.querySelector('[data-lightbox-fechar]').addEventListener('click', function () { dialogo.close(); });
    dialogo.querySelector('[data-lightbox-ant]').addEventListener('click', function () { mostrar(atual - 1); });
    dialogo.querySelector('[data-lightbox-prox]').addEventListener('click', function () { mostrar(atual + 1); });
    dialogo.addEventListener('click', function (e) {
      if (e.target === dialogo || e.target.classList.contains('lightbox__figura')) dialogo.close();
    });
    dialogo.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') mostrar(atual - 1);
      if (e.key === 'ArrowRight') mostrar(atual + 1);
    });

    var toqueX = null;
    dialogo.addEventListener('touchstart', function (e) { toqueX = e.touches[0].clientX; }, { passive: true });
    dialogo.addEventListener('touchend', function (e) {
      if (toqueX === null) return;
      var dx = e.changedTouches[0].clientX - toqueX;
      if (Math.abs(dx) > 50) mostrar(atual + (dx < 0 ? 1 : -1));
      toqueX = null;
    });
  }

  /* ---------- Ano no rodapé ---------- */
  var ano = document.querySelector('[data-ano]');
  if (ano) ano.textContent = new Date().getFullYear();
})();
