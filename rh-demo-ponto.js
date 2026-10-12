/* ============================================================================
 * rh-demo-ponto.js · dados de mentira do espelho de ponto, do almoxarifado e do portal (?demo=1)
 *
 * Carregar DEPOIS de rh-demo.js. Acrescenta ao window.SigmaRHDemo as RPCs do
 * espelho de ponto (RH) e do portal do colaborador. Estado próprio no navegador
 * (chave sigmarh_demo_ponto_v1), para não mexer na demonstração da contratação.
 * Os nomes e formatos aqui são o CONTRATO que o banco vai ter que cumprir.
 * Nomes de pessoas são inventados.
 * ========================================================================== */
(() => {
  if (!new URLSearchParams(location.search).has('demo')) return;

  const CHAVE = 'sigmarh_demo_ponto_v1';
  const pad = n => String(n).padStart(2, '0');
  const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho',
    'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  const SEMANA = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
  const agoraISO = () => new Date().toISOString();
  const hojeISO = () => new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
  const emDias = n => { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
  const codigoConf = () => Array.from({ length: 12 }, () => '0123456789ABCDEF'[Math.floor(Math.random() * 16)]).join('');

  // Competência = mês anterior ao de hoje (o espelho de setembro é assinado em outubro).
  const COMP = (() => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - 1);
    return d.getFullYear() + '-' + pad(d.getMonth() + 1); })();
  const nomeComp = c => { const [a, m] = c.split('-'); return MESES[+m - 1] + ' de ' + a; };

  // Quem está no contrato. JOÃO BATISTA NUNES é quem abre o portal na demonstração.
  const PESSOAS = [
    { codigo: 'QQ55RR66', nome: 'JOÃO BATISTA NUNES',      funcao: 'ENCARREGADO',          matricula: '000412', whatsapp: '21991110001' },
    { codigo: 'QQ77RR88', nome: 'SANDRA REGINA LOPES',     funcao: 'SOLDADOR',             matricula: '000418', whatsapp: '21991110002' },
    { codigo: 'PA10PB11', nome: 'ADRIANO SOUZA MELO',      funcao: 'CALDEIREIRO',          matricula: '000421', whatsapp: '21991110003' },
    { codigo: 'PA12PB13', nome: 'CLÁUDIO RAMOS PINTO',     funcao: 'MONTADOR',             matricula: '000425', whatsapp: '21991110004' },
    { codigo: 'PA14PB15', nome: 'DIEGO FERNANDES ALVES',   funcao: 'AJUDANTE',             matricula: '000430', whatsapp: '21991110005' },
    { codigo: 'PA16PB17', nome: 'EDSON LUIZ CARVALHO',     funcao: 'SOLDADOR',             matricula: '000433', whatsapp: '21991110006' },
    { codigo: 'PA18PB19', nome: 'FÁBIO HENRIQUE COSTA',    funcao: 'PINTOR',               matricula: '000437', whatsapp: '' },
    { codigo: 'PA20PB21', nome: 'GILSON MARQUES DA SILVA', funcao: 'CALDEIREIRO',          matricula: '000440', whatsapp: '21991110008' },
    { codigo: 'PA22PB23', nome: 'HÉLIO TAVARES BRAGA',     funcao: 'MONTADOR',             matricula: '000444', whatsapp: '21991110009' },
    { codigo: 'PA24PB25', nome: 'IVAN PEREIRA DUTRA',      funcao: 'AJUDANTE',             matricula: '000447', whatsapp: '21991110010' },
    { codigo: 'PA26PB27', nome: 'JORGE LUÍS MACHADO',      funcao: 'TÉCNICO DE SEGURANÇA', matricula: '000451', whatsapp: '21991110011' },
    { codigo: 'PA28PB29', nome: 'KLEBER ANTUNES REIS',     funcao: 'SOLDADOR',             matricula: '000455', whatsapp: '21991110012' },
  ];
  const EU = PESSOAS[0];
  // Duas páginas do PDF que o sistema não consegue casar com ninguém (nome diferente no relógio, gente nova).
  const SEM_DONO = [
    { pagina: 13, nome_lido: 'J. C. SOUZA', matricula_lida: '000460' },
    { pagina: 14, nome_lido: 'MARIA G. SILVA', matricula_lida: '' },
  ];

  const S0 = { comps: {} };
  let S;
  try { S = JSON.parse(localStorage.getItem(CHAVE) || 'null'); } catch (e) { S = null; }
  if (!S || !S.comps) S = JSON.parse(JSON.stringify(S0));
  const salvar = () => { try { localStorage.setItem(CHAVE, JSON.stringify(S)); } catch (e) {} };

  /* Almoxarifado do João. EPI: entrega com confirmação por PIN (substitui a ficha de EPI em papel).
     Material: mesmos campos de public.retiradas_material (descrição, quantidade, plaqueta, LS, situação). */
  function almox() {
    if (!S.almox) S.almox = {
      epi: [
        { id: 'E1', item: 'Luva de vaqueta', ca: 'CA 12345', qtd: 2, unidade: 'par', entregue_em: emDias(-1), situacao: 'confirmar', troca: 'quando danificar' },
        { id: 'E2', item: 'Óculos de proteção incolor', ca: 'CA 23456', qtd: 1, unidade: 'un', entregue_em: emDias(-1), situacao: 'confirmar', troca: 'quando riscar' },
        { id: 'E3', item: 'Capacete classe B com jugular', ca: 'CA 34567', qtd: 1, unidade: 'un', entregue_em: emDias(-40), situacao: 'confirmado', confirmado_em: emDias(-40) + 'T07:12:00Z', troca: 'validade 2 anos' },
        { id: 'E4', item: 'Botina de segurança nº 41', ca: 'CA 45678', qtd: 1, unidade: 'par', entregue_em: emDias(-40), situacao: 'confirmado', confirmado_em: emDias(-40) + 'T07:12:00Z', troca: 'a cada 6 meses' },
        { id: 'E5', item: 'Protetor auricular tipo plug', ca: 'CA 56789', qtd: 5, unidade: 'par', entregue_em: emDias(-12), situacao: 'confirmado', confirmado_em: emDias(-12) + 'T07:05:00Z', troca: 'semanal' },
      ],
      material: [
        { descricao: 'Junta espiralada 4" 300#', qtd: 4, unidade: 'un', plaqueta: 'PL-3400-118', ls: 'LS-3400-07', liberado_em: emDias(-3), situacao: 'liberada' },
        { descricao: 'Estojo de prisioneiros 3/4" x 120 mm', qtd: 8, unidade: 'un', plaqueta: 'PL-3400-118', ls: 'LS-3400-07', liberado_em: emDias(-3), situacao: 'liberada' },
        { descricao: 'Eletrodo E7018 3,25 mm', qtd: 5, unidade: 'kg', plaqueta: 'PL-3500-042', ls: 'LS-3500-02', liberado_em: null, situacao: 'solicitada' },
      ]
    };
    return S.almox;
  }

  const pessoa = cod => { const p = PESSOAS.find(x => x.codigo === cod); if (!p) throw new Error('Pessoa não encontrada.'); return p; };
  const competencia = c => { const x = S.comps[c]; if (!x) throw new Error('O espelho de ' + nomeComp(c) + ' ainda não foi importado.'); return x; };
  const pinRecusado = p => p === '1234' ? null
    : { ok: false, motivo: 'incorreto', mensagem: 'PIN incorreto. Na demonstração o PIN é 1234.' };

  /* Marcações de mentira do mês: 07:00 às 16:30 com uma hora de almoço,
     algumas horas extras, fim de semana de folga, uma falta justificada. */
  function dias(c, cod) {
    const [a, m] = c.split('-').map(Number);
    const n = new Date(a, m, 0).getDate();
    const semente = cod.charCodeAt(2) + cod.charCodeAt(5);
    const out = [];
    for (let d = 1; d <= n; d++) {
      const w = new Date(a, m - 1, d).getDay();
      const linha = { dia: pad(d) + '/' + pad(m), semana: SEMANA[w], e1: '', s1: '', e2: '', s2: '', total: '', obs: '' };
      if (w === 0 || w === 6) linha.obs = 'Folga';
      else if (m === 9 && d === 7) linha.obs = 'Feriado';
      else if ((d * semente) % 23 === 5) linha.obs = 'Falta justificada (atestado)';
      else {
        const extra = (d * semente) % 7 === 3;
        Object.assign(linha, { e1: '07:0' + (d % 3), s1: '11:30', e2: '12:30', s2: extra ? '18:30' : '16:3' + (d % 2),
          total: extra ? '10:00' : '08:00', obs: extra ? 'Hora extra autorizada' : '' });
      }
      out.push(linha);
    }
    return out;
  }
  function resumo(ds) {
    const trab = ds.filter(d => d.total).length;
    const extras = ds.filter(d => d.total === '10:00').length * 2;
    return { dias_trabalhados: trab, horas_normais: (trab * 8) + 'h', horas_extras: extras + 'h',
      faltas: ds.filter(d => /Falta/.test(d.obs)).length };
  }

  const API = {
    // ── RH (com login) ──
    rh_ponto_competencias: () => {
      const lista = Object.keys(S.comps).sort().reverse().map(c => {
        const x = S.comps[c], ps = Object.values(x.pessoas);
        return { competencia: c, nome: nomeComp(c), importado_em: x.importado_em, total: ps.length,
          assinados: ps.filter(p => p.situacao === 'assinado').length };
      });
      if (!S.comps[COMP]) lista.unshift({ competencia: COMP, nome: nomeComp(COMP), importado_em: null, total: 0, assinados: 0 });
      return lista;
    },
    rh_ponto_painel: ({ p_competencia }) => {
      const c = p_competencia || COMP, x = S.comps[c];
      if (!x) return { competencia: c, nome: nomeComp(c), importado: null };
      const pessoas = Object.entries(x.pessoas).map(([cod, s]) => {
        const p = pessoa(cod);
        return Object.assign({ codigo: cod, nome: p.nome, funcao: p.funcao, tem_whatsapp: !!p.whatsapp }, s);
      }).sort((a, b) => a.nome.localeCompare(b.nome));
      const conta = s => pessoas.filter(p => p.situacao === s).length;
      const casadas = Object.keys(x.pessoas);
      return { competencia: c, nome: nomeComp(c), prazo: x.prazo,
        importado: { arquivo: x.arquivo, em: x.importado_em, paginas: x.paginas },
        total: pessoas.length, assinados: conta('assinado'), pendentes: conta('pendente'), discordou: conta('discordou'),
        sem_dono: x.sem_dono.length, pessoas, paginas_sem_dono: x.sem_dono,
        // quem está no contrato e não tem página casada: o RH escolhe na hora de vincular
        sem_espelho: PESSOAS.filter(p => !casadas.includes(p.codigo)).map(p => ({ codigo: p.codigo, nome: p.nome })) };
    },
    rh_ponto_importar: ({ p_competencia, p_prazo, p_arquivo }) => {
      const c = p_competencia || COMP;
      if (S.comps[c]) throw new Error('O espelho de ' + nomeComp(c) + ' já foi importado. Para trocar uma página, use "Reenviar corrigido" na pessoa.');
      if (!p_prazo || p_prazo < hojeISO()) throw new Error('Escolha um prazo para assinar a partir de hoje.');
      // Na demonstração duas pessoas (as de índice 10 e 11) ficam de fora para aparecer em "Sem dono".
      const casadas = PESSOAS.slice(0, 10);
      const pessoas = {};
      casadas.forEach(p => { pessoas[p.codigo] = { situacao: 'pendente', versao: 1, enviado_em: agoraISO(), cobrancas: 0 }; });
      S.comps[c] = { arquivo: p_arquivo || 'espelho.pdf', importado_em: agoraISO(), prazo: p_prazo,
        paginas: casadas.length + SEM_DONO.length, pessoas, sem_dono: SEM_DONO.map(x => Object.assign({}, x)) };
      return { ok: true, paginas: casadas.length + SEM_DONO.length, casadas: casadas.length, sem_dono: SEM_DONO.length };
    },
    rh_ponto_vincular: ({ p_competencia, p_pagina, p_codigo }) => {
      const x = competencia(p_competencia);
      const i = x.sem_dono.findIndex(s => s.pagina === p_pagina);
      if (i < 0) throw new Error('Esta página já foi vinculada.');
      if (x.pessoas[p_codigo]) throw new Error('Esta pessoa já tem espelho neste mês.');
      pessoa(p_codigo);
      x.sem_dono.splice(i, 1);
      x.pessoas[p_codigo] = { situacao: 'pendente', versao: 1, enviado_em: agoraISO(), cobrancas: 0, pagina: p_pagina };
      return { ok: true };
    },
    // Cobrança: devolve a mensagem pronta; o RH manda pelo WhatsApp dele. Conta quantas vezes cobrou.
    rh_ponto_cobrar: ({ p_competencia, p_codigo }) => {
      const x = competencia(p_competencia), s = x.pessoas[p_codigo], p = pessoa(p_codigo);
      if (!s || s.situacao === 'assinado') throw new Error('Esta pessoa já assinou.');
      s.cobrancas = (s.cobrancas || 0) + 1; s.ultima_cobranca = agoraISO();
      const link = location.origin + location.pathname.replace(/[^/]*$/, '') + 'portal.html?k=demo&demo=1';
      const prazo = x.prazo.split('-').reverse().slice(0, 2).join('/');
      return { ok: true, nome: p.nome, whatsapp: p.whatsapp || null, link,
        mensagem: `Olá, ${p.nome.split(' ')[0]}! Aqui é o RH da GCB. Seu espelho de ponto de ${nomeComp(p_competencia)} está esperando a sua assinatura até ${prazo}.\n\n`
          + `Abra o seu link, confira os dias e assine com o seu PIN do treinamento:\n${link}\n\nSe algum dia estiver errado, toque em "Não concordo" e diga qual.` };
    },
    rh_ponto_responder: ({ p_competencia, p_codigo, p_acao, p_resposta }) => {
      const x = competencia(p_competencia), s = x.pessoas[p_codigo];
      if (!s || s.situacao !== 'discordou') throw new Error('Esta pessoa não tem discordância aberta.');
      if (String(p_resposta || '').trim().length < 10) throw new Error('Escreva a resposta para a pessoa (pelo menos 10 letras).');
      s.historico = (s.historico || []).concat([{ discordancia: s.discordancia, resposta: p_resposta, acao: p_acao, em: agoraISO() }]);
      s.resposta_rh = p_resposta.trim();
      if (p_acao === 'corrigido') s.versao = (s.versao || 1) + 1;
      s.situacao = 'pendente'; s.discordancia = null; s.enviado_em = agoraISO();
      return { ok: true };
    },

    // ── Colaborador (link pessoal + PIN) ──
    col_inicio: () => {
      const pend = Object.entries(S.comps).sort().reverse()
        .map(([c, x]) => ({ c, x, s: x.pessoas[EU.codigo] })).filter(o => o.s);
      const aberto = pend.find(o => o.s.situacao !== 'assinado');
      const ultimo = pend.find(o => o.s.situacao === 'assinado');
      return { nome: EU.nome, funcao: EU.funcao,
        espelho: aberto ? { competencia: aberto.c, nome: nomeComp(aberto.c), prazo: aberto.x.prazo, situacao: aberto.s.situacao,
          versao: aberto.s.versao, resposta_rh: aberto.s.resposta_rh || null } : null,
        ultimo_assinado: ultimo ? { competencia: ultimo.c, nome: nomeComp(ultimo.c), assinado_em: ultimo.s.assinado_em, codigo: ultimo.s.codigo_conf } : null,
        treinamentos: { aptos: 7, exigidos: 8, vencendo: 1 },
        avisos: [{ titulo: 'Exame periódico', texto: 'Quem faz aniversário em novembro: procure o RH para marcar o exame.', em: emDias(-2) }] };
    },
    col_espelho: ({ p_competencia }) => {
      const x = competencia(p_competencia), s = x.pessoas[EU.codigo];
      if (!s) throw new Error('Não há espelho seu em ' + nomeComp(p_competencia) + '. Fale com o RH.');
      const ds = dias(p_competencia, EU.codigo);
      // versão corrigida pelo RH: a demonstração muda um dia para mostrar a diferença
      if (s.versao > 1) { const d = ds.find(l => l.total === '08:00'); if (d) { d.s2 = '18:30'; d.total = '10:00'; d.obs = 'Corrigido pelo RH'; } }
      return { nome: EU.nome, funcao: EU.funcao, matricula: EU.matricula, competencia: p_competencia, nome_comp: nomeComp(p_competencia),
        empresa: 'GCB Manutenção', contrato: 'Contrato SAP 4600686554', versao: s.versao, situacao: s.situacao, prazo: x.prazo,
        resposta_rh: s.resposta_rh || null, dias: ds, resumo: resumo(ds), assinado_em: s.assinado_em || null, codigo: s.codigo_conf || null };
    },
    col_ponto_assinar: ({ p_pin, p_competencia, p_versao }) => {
      const nao = pinRecusado(p_pin); if (nao) return nao;
      const s = competencia(p_competencia).pessoas[EU.codigo];
      if (s.situacao === 'assinado') throw new Error('Você já assinou este espelho.');
      if (p_versao !== s.versao) throw new Error('O RH mandou uma versão nova deste espelho. Abra de novo para conferir.');
      Object.assign(s, { situacao: 'assinado', assinado_em: agoraISO(), codigo_conf: codigoConf() });
      return { ok: true, assinado_em: s.assinado_em, codigo: s.codigo_conf };
    },
    col_ponto_discordar: ({ p_pin, p_competencia, p_dias, p_motivo }) => {
      if (!p_dias || !p_dias.length) throw new Error('Toque nos dias que estão errados.');
      if (String(p_motivo || '').replace(/[^a-zà-ú]/gi, '').length < 10) throw new Error('Explique o que está errado (pelo menos 10 letras).');
      const nao = pinRecusado(p_pin); if (nao) return nao;
      const s = competencia(p_competencia).pessoas[EU.codigo];
      if (s.situacao === 'assinado') throw new Error('Você já assinou este espelho.');
      Object.assign(s, { situacao: 'discordou', discordancia: { dias: p_dias, motivo: p_motivo.trim(), em: agoraISO() }, resposta_rh: null });
      return { ok: true };
    },

    // ── Almoxarifado: material retirado (espelha public.retiradas_material) e EPI (planejado) ──
    col_almox: () => {
      const a = almox();
      return { epi: a.epi, material: a.material,
        a_confirmar: a.epi.filter(e => e.situacao === 'confirmar').length };
    },
    col_epi_confirmar: ({ p_pin, p_ids }) => {
      if (!p_ids || !p_ids.length) throw new Error('Nada para confirmar.');
      const nao = pinRecusado(p_pin); if (nao) return nao;
      const a = almox(), em = agoraISO(), codigo = codigoConf();
      a.epi.filter(e => p_ids.includes(e.id) && e.situacao === 'confirmar')
        .forEach(e => Object.assign(e, { situacao: 'confirmado', confirmado_em: em, codigo }));
      return { ok: true, confirmado_em: em, codigo };
    },

    // ── Só da demonstração ──
    demo_ponto_avancar: ({ p_competencia }) => {
      const x = competencia(p_competencia || COMP);
      const fila = Object.entries(x.pessoas).filter(([cod, s]) => cod !== EU.codigo && s.situacao === 'pendente');
      fila.slice(0, 5).forEach(([cod, s], i) => {
        if (i === 4) Object.assign(s, { situacao: 'discordou', discordancia: { dias: ['03/' + COMP.slice(5), '04/' + COMP.slice(5)],
          motivo: 'Fiquei até 18h30 nesses dois dias e saiu 16h30.', em: agoraISO() } });
        else Object.assign(s, { situacao: 'assinado', assinado_em: agoraISO(), codigo_conf: codigoConf() });
      });
      return { ok: true };
    },
    demo_ponto_reiniciar: () => { try { localStorage.removeItem(CHAVE); } catch (e) {} S = JSON.parse(JSON.stringify(S0)); return { ok: true }; },
  };

  window.SigmaRHDemo = window.SigmaRHDemo || {};
  Object.entries(API).forEach(([k, f]) => { window.SigmaRHDemo[k] = args => { const r = f(args); salvar(); return r; }; });
})();
