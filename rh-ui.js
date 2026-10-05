/* ============================================================================
 * rh-ui.js · casca do Sigma RH (rh.sigmacode.com.br)
 *
 * Toda página do Sigma RH, menos login, reset-senha e index, faz:
 *
 *   <body data-pagina="efetivo">
 *     <div id="app"> ...conteúdo da página... </div>
 *     <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
 *     <script src="rh-ui.js"></script>
 *     <script> const ok = await SigmaRH.init(); if (!ok) return; ... </script>
 *
 * A casca monta cabeçalho, menu lateral e rodapé, e cuida da guarda de acesso:
 *   sem sessão          -> login.html
 *   sessão sem papel    -> tela "sem acesso" com botão Sair
 * O papel vem do JWT: app_metadata.roles.sigmatr (decisão D6, 05/10/2026).
 * Papéis aceitos: rh e admin. A guarda de verdade está no banco (cada RPC
 * confere o papel); a da casca só evita mostrar tela vazia.
 *
 * Banco: mesmo projeto Supabase do treinamento, schema sigmatr. Toda leitura e
 * escrita é por RPC. Nenhuma página faz .from(...).
 * ========================================================================== */
const SigmaRH = (() => {
  const VERSAO = '2026-10-05 · fase 1';

  const URL_SB = 'https://kiwiykgzogcxiseynzyy.supabase.co';
  // Chave anon, pública por desenho (a mesma das telas do treinamento).
  // Quem protege o dado é a guarda de papel dentro de cada função.
  const KEY_SB = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtpd2l5a2d6b2djeGlzZXluenl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1MzQ0MDYsImV4cCI6MjA5NzExMDQwNn0.usaaGrGFhizyVqCl1IOPykGfW_EUha3d-pF9_AHUojU';
  const SCHEMA = 'sigmatr';
  const PAPEIS = ['rh', 'admin'];

  const BRAND = {
    bucket:   'https://kiwiykgzogcxiseynzyy.supabase.co/storage/v1/object/public/LOGO-Empresas/',
    logo:     'sigmacode.png',
    produto:  'Sigma RH',
    subtitulo:'Efetivo do contrato',
    contrato: 'Contrato SAP 4600686554'
  };

  // Menu. "em_breve" aparece apagado e não navega.
  const NAV = [
    { grupo: 'Principal' },
    { id: 'painel',  label: 'Painel',               href: 'shell.html',
      icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM9 22V12h6v10' },
    { grupo: 'Pessoas' },
    { id: 'efetivo', label: 'Efetivo no contrato',  href: 'efetivo.html',
      icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75' },
    { id: 'documentos', label: 'Documentos de admissão', em_breve: 'fase 2',
      icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6' },
    { id: 'afastamentos', label: 'Afastamentos', em_breve: 'fase 2',
      icon: 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z' },
  ];

  let db = null;

  const esc = s => String(s ?? '').replace(/[&<>"']/g, c =>
    ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));

  const fmt = {
    codigo: c => String(c || '').toUpperCase().replace(/(.{4})(.{4})/, '$1 $2'),
    data:   d => d ? String(d).slice(0, 10).split('-').reverse().join('/') : '',
    hoje:   () => new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' })
  };

  function conectar() {
    if (db) return db;
    if (!window.supabase) throw new Error('supabase-js não carregou. Confira a internet e recarregue.');
    db = window.supabase.createClient(URL_SB, KEY_SB, {
      db: { schema: SCHEMA },
      auth: { persistSession: true, autoRefreshToken: true }
    });
    return db;
  }

  const papelDaSessao = ss =>
    (ss && ss.user && ss.user.app_metadata && ss.user.app_metadata.roles
      && ss.user.app_metadata.roles.sigmatr) || null;

  async function sessao() {
    const { data } = await conectar().auth.getSession();
    return data.session;
  }

  async function sair() {
    try { await conectar().auth.signOut(); } catch (e) {}
    try { sessionStorage.clear(); } catch (e) {}
    window.location.replace('login.html');
  }

  /* Erro do banco em português, nunca código na cara de ninguém. As mensagens
     das RPCs do Sigma RH já saem em português; aqui só traduzimos as do sistema. */
  function frase(error) {
    if (!error) return '';
    const m = String(error.message || '');
    if (error.code === '42501' && /permission|permiss/i.test(m))
      return 'Sua conta não tem permissão para isso. Fale com o administrador.';
    if (error.code === 'PGRST202' || error.code === '42883')
      return 'Esta função ainda não foi instalada no banco. Fale com o administrador.';
    if (error.code === 'PGRST301' || /JWT|token/i.test(m))
      return 'Sua sessão expirou. Entre de novo.';
    if (/fetch|network|Failed to/i.test(m))
      return 'Sem conexão. Confira a internet e tente de novo.';
    return m || 'Não foi possível concluir.';
  }

  // ── CSS da casca (tokens do E-SIGMA) ──────────────────────────────────────
  const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');
:root{--blue:#0F4CBA;--blue-700:#0B3A91;--green:#22C55E;--green-600:#16A34A;
  --graphite:#1F2937;--graphite-900:#141B26;--canvas:#F1F4F9;--white:#fff;
  --ink:#1F2937;--ink-soft:#4B5563;--muted:#6B7280;--line:#E5E7EB;--field:#F4F6FA;
  --danger:#EF4444;--warning:#F59E0B;--font-d:'Exo 2',system-ui,sans-serif;
  --font-ui:'Inter',system-ui,sans-serif;--r:10px;--r-md:12px;
  --side-w:250px;--header-h:64px;--sh:0 1px 2px rgba(16,24,40,.06),0 1px 3px rgba(16,24,40,.10)}
*{box-sizing:border-box;margin:0;padding:0}
html,body{min-height:100%}
body{font-family:var(--font-ui);color:var(--ink);background:var(--canvas);-webkit-font-smoothing:antialiased}
a{color:inherit;text-decoration:none}
.rh-app{display:grid;grid-template-columns:var(--side-w) 1fr;grid-template-rows:var(--header-h) 1fr;
  grid-template-areas:"head head" "side main";min-height:100vh}
.rh-head{grid-area:head;position:sticky;top:0;z-index:40;background:#fff;border-bottom:1px solid var(--line);
  display:flex;align-items:center;gap:14px;padding:0 20px;box-shadow:var(--sh)}
.rh-head img{height:34px;width:auto}
.rh-head .prod{display:flex;flex-direction:column;line-height:1.15}
.rh-head .prod b{font-family:var(--font-d);font-size:16px;color:var(--graphite)}
.rh-head .prod span{font-size:11.5px;color:var(--muted)}
.rh-head .usu{margin-left:auto;display:flex;align-items:center;gap:12px;font-size:13px;color:var(--ink-soft)}
.rh-head .usu b{color:var(--graphite)}
.rh-burger{display:none;width:44px;height:44px;border:1px solid var(--line);border-radius:10px;background:#fff;cursor:pointer}
.rh-side{grid-area:side;background:linear-gradient(180deg,var(--graphite),var(--graphite-900));
  color:#CBD5E1;padding:16px 10px;overflow-y:auto}
.rh-side .grupo{font-size:10.5px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;
  color:#64748B;margin:16px 10px 6px}
.rh-side a,.rh-side span.item{display:flex;align-items:center;gap:11px;min-height:44px;padding:0 12px;
  border-radius:9px;font-size:14px;font-weight:500;color:#CBD5E1}
.rh-side a:hover{background:rgba(255,255,255,.06);color:#fff}
.rh-side a[aria-current="page"]{background:rgba(15,76,186,.35);color:#fff}
.rh-side svg{width:18px;height:18px;stroke:currentColor;fill:none;stroke-width:2;flex:none}
.rh-side span.item{opacity:.45;cursor:default}
.rh-side span.item small{margin-left:auto;font-size:10px;background:#334155;padding:2px 6px;border-radius:4px}
.rh-side .contrato{margin:22px 10px 0;font-size:11.5px;color:#64748B;line-height:1.5}
.rh-main{grid-area:main;display:flex;flex-direction:column;min-width:0}
.rh-main .content{flex:1;padding:24px 28px;max-width:1280px;width:100%}
.rh-foot{border-top:1px solid var(--line);background:#fff;padding:10px 28px;display:flex;gap:18px;
  font-size:12px;color:var(--muted)}
.rh-foot .r{margin-left:auto}

/* componentes comuns */
.st-page-head{margin-bottom:20px}
.st-page-head h1{font-family:var(--font-d);font-size:24px;font-weight:700;color:var(--graphite)}
.st-page-head p{font-size:13.5px;color:var(--muted);margin-top:4px;line-height:1.55}
.st-card{background:#fff;border:1px solid var(--line);border-radius:var(--r-md);padding:20px;box-shadow:var(--sh)}
.st-mono{font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-variant-numeric:tabular-nums}
.st-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:48px;padding:0 20px;
  border:1px solid transparent;border-radius:10px;background:var(--blue);color:#fff;font:600 15px var(--font-ui);
  cursor:pointer;box-shadow:0 6px 16px -8px rgba(15,76,186,.6)}
.st-btn:hover{filter:brightness(1.06)}
.st-btn:disabled{opacity:.55;cursor:wait}
.st-btn[data-tom="quieto"]{background:#fff;color:var(--ink-soft);border-color:var(--line);box-shadow:none}
.st-btn[data-tom="perigo"]{background:#DC2626;box-shadow:0 6px 16px -8px rgba(220,38,38,.6)}
.st-field{display:flex;flex-direction:column;gap:6px;margin-bottom:16px}
.st-field label{font-size:13px;font-weight:600;color:var(--graphite)}
.st-field input,.st-field select,.st-field textarea{min-height:46px;padding:0 12px;font:inherit;font-size:16px;
  border:1.5px solid #D7DEEA;border-radius:10px;background:var(--field);color:var(--ink)}
.st-field input:focus,.st-field select:focus{outline:none;background:#fff;border-color:var(--blue);
  box-shadow:0 0 0 3px rgba(15,76,186,.14)}
.st-tarja{display:inline-flex;align-items:center;gap:7px;padding:5px 10px;border-radius:999px;font-size:12.5px;
  font-weight:600;border:1px solid}
.st-tarja::before{content:"";width:7px;height:7px;border-radius:50%;background:currentColor;flex:none}
.st-tarja[data-s="ok"]{color:#15803D;background:#F0FDF4;border-color:#BBF7D0}
.st-tarja[data-s="aviso"]{color:#B45309;background:#FFFBEB;border-color:#FDE68A}
.st-tarja[data-s="nao"]{color:#B91C1C;background:#FEF2F2;border-color:#FECACA}
.st-tarja[data-s="neutro"]{color:#475569;background:#F8FAFC;border-color:#E2E8F0}
.st-toasts{position:fixed;right:20px;bottom:20px;z-index:95;display:flex;flex-direction:column;gap:8px;max-width:420px}
.st-toast{padding:13px 15px;border-radius:10px;font-size:14px;color:#fff;background:var(--graphite);box-shadow:var(--sh)}
.st-toast[data-tom="ok"]{background:#15803D}.st-toast[data-tom="erro"]{background:#DC2626}
.st-modal{border:0;padding:0;border-radius:14px;width:min(500px,calc(100vw - 32px));margin:auto}
.st-modal::backdrop{background:rgba(16,24,40,.55)}
.st-modal-in{padding:22px;background:#fff}
.st-modal h2{font-family:var(--font-d);font-size:18px;color:var(--graphite);margin-bottom:8px}
.st-modal p{font-size:14px;color:var(--ink-soft);margin-bottom:14px;line-height:1.55}
.st-impact{margin:0 0 18px;padding:12px 14px;border-radius:8px;background:#FEF2F2;border:1px solid #FECACA;
  color:#991B1B;font-size:13.5px;line-height:1.5}
.st-modal-acts{display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap}
.rh-bloqueio{max-width:460px;margin:12vh auto;text-align:center}
.rh-bloqueio h1{font-family:var(--font-d);font-size:22px;margin-bottom:10px}
.rh-bloqueio p{color:var(--ink-soft);margin-bottom:20px;line-height:1.6}
@media(max-width:860px){
  .rh-app{grid-template-columns:1fr;grid-template-areas:"head" "main"}
  .rh-burger{display:inline-flex;align-items:center;justify-content:center}
  .rh-side{display:none;position:fixed;top:var(--header-h);left:0;bottom:0;width:var(--side-w);z-index:50}
  .rh-side[data-aberto="1"]{display:block}
  .rh-head .usu span.nm{display:none}
  .rh-main .content{padding:16px}
}`;

  function injetarCSS() {
    if (document.getElementById('rh-ui-css')) return;
    const s = document.createElement('style');
    s.id = 'rh-ui-css'; s.textContent = CSS;
    document.head.appendChild(s);
  }

  function toast(texto, tom) {
    let cx = document.getElementById('st-toasts');
    if (!cx) {
      cx = Object.assign(document.createElement('div'), { id: 'st-toasts', className: 'st-toasts' });
      cx.setAttribute('role', 'status'); document.body.appendChild(cx);
    }
    const t = document.createElement('div');
    t.className = 'st-toast'; if (tom) t.dataset.tom = tom;
    t.textContent = texto; cx.appendChild(t);
    setTimeout(() => t.remove(), tom === 'erro' ? 8000 : 4500);
  }

  function confirmar({ titulo, texto, impacto, acao = 'Confirmar', tom = 'perigo' }) {
    return new Promise(res => {
      const d = document.createElement('dialog');
      d.className = 'st-modal';
      d.innerHTML = `<div class="st-modal-in"><h2>${esc(titulo)}</h2>
        ${texto ? `<p>${esc(texto)}</p>` : ''}
        ${impacto ? `<div class="st-impact">${esc(impacto)}</div>` : ''}
        <div class="st-modal-acts">
          <button class="st-btn" data-tom="quieto" value="nao">Cancelar</button>
          <button class="st-btn" ${tom === 'perigo' ? 'data-tom="perigo"' : ''} value="sim">${esc(acao)}</button>
        </div></div>`;
      document.body.appendChild(d);
      d.querySelectorAll('button').forEach(b =>
        b.onclick = () => { d.close(); d.remove(); res(b.value === 'sim'); });
      d.addEventListener('cancel', () => { d.remove(); res(false); });
      d.showModal();
    });
  }

  function menu(pagina) {
    return NAV.map(it => {
      if (it.grupo) return `<div class="grupo">${esc(it.grupo)}</div>`;
      const ic = `<svg viewBox="0 0 24 24"><path d="${it.icon}"/></svg>`;
      if (it.em_breve) return `<span class="item">${ic}${esc(it.label)}<small>${esc(it.em_breve)}</small></span>`;
      return `<a href="${it.href}"${it.id === pagina ? ' aria-current="page"' : ''}>${ic}${esc(it.label)}</a>`;
    }).join('') + `<div class="contrato">${esc(BRAND.contrato)}<br>GCB Manutenção</div>`;
  }

  /* init: guarda + casca. Devolve { papel, email } ou null (já redirecionou). */
  async function init() {
    injetarCSS();
    console.log('%c[Sigma RH] casca ' + VERSAO, 'color:#0F4CBA;font-weight:700');
    const app = document.getElementById('app');
    if (!app) { document.body.textContent = 'Página sem <div id="app">.'; return null; }
    app.style.display = 'none';

    let ss;
    try { conectar(); ss = await sessao(); }
    catch (e) { app.style.display = ''; app.innerHTML = `<p style="padding:24px">${esc(frase(e))}</p>`; return null; }

    if (!ss) { window.location.replace('login.html'); return null; }

    const papel = papelDaSessao(ss);
    if (!PAPEIS.includes(papel)) {
      app.style.display = '';
      app.innerHTML = `<div class="rh-bloqueio st-card">
        <h1>Sua conta não tem acesso ao Sigma RH</h1>
        <p>Você entrou como <b>${esc(ss.user.email)}</b>, mas esta conta não tem o papel de RH.
           Peça ao administrador para liberar o acesso.</p>
        <button class="st-btn" id="rh-sair">Sair</button></div>`;
      document.getElementById('rh-sair').onclick = sair;
      return null;
    }

    const pagina = document.body.dataset.pagina || '';
    const wrap = document.createElement('div');
    wrap.className = 'rh-app';
    wrap.innerHTML = `
      <header class="rh-head">
        <button class="rh-burger" type="button" aria-label="Abrir menu">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg></button>
        <img src="${BRAND.bucket + BRAND.logo}" alt="SIGMA CODE Engenharia">
        <div class="prod"><b>${esc(BRAND.produto)}</b><span>${esc(BRAND.subtitulo)}</span></div>
        <div class="usu"><span class="nm"><b>${esc(ss.user.email)}</b> · ${papel === 'admin' ? 'Administrador' : 'RH'}</span>
          <button class="st-btn" data-tom="quieto" type="button" id="rh-sair">Sair</button></div>
      </header>
      <nav class="rh-side" aria-label="Menu" data-aberto="0">${menu(pagina)}</nav>
      <main class="rh-main"></main>`;
    const main = wrap.querySelector('.rh-main');
    app.parentNode.removeChild(app);
    app.style.display = '';
    main.appendChild(app);
    const foot = document.createElement('footer');
    foot.className = 'rh-foot';
    foot.innerHTML = `<span>${esc(BRAND.produto)} <b>${esc(VERSAO)}</b></span>
      <span id="rh-versao-pagina"></span><span class="r">© 2026 SIGMA CODE</span>`;
    main.appendChild(foot);
    document.body.insertBefore(wrap, document.body.firstChild);

    wrap.querySelector('#rh-sair').onclick = sair;
    const side = wrap.querySelector('.rh-side');
    wrap.querySelector('.rh-burger').onclick = () =>
      { side.dataset.aberto = side.dataset.aberto === '1' ? '0' : '1'; };

    // sessão encerrada em outra aba: volta ao login
    db.auth.onAuthStateChange(ev => { if (ev === 'SIGNED_OUT') window.location.replace('login.html'); });

    return { papel, email: ss.user.email };
  }

  function versaoPagina(v) {
    console.log('[Sigma RH] página ' + v);
    const el = document.getElementById('rh-versao-pagina');
    if (el) el.textContent = 'página ' + v;
  }

  return { VERSAO, BRAND, init, conectar, sessao, sair, papelDaSessao, PAPEIS,
           esc, fmt, frase, toast, confirmar, versaoPagina,
           get db() { return conectar(); } };
})();

// Registro global: `const` no topo de <script src> não vira window.SigmaRH sozinho.
window.SigmaRH = SigmaRH;
