/* ============================================================================
 * rh-demo.js · dados de mentira para o modo demonstração (?demo=1)
 *
 * Só é usado quando a URL tem ?demo=1. Responde com os mesmos nomes e formatos
 * das RPCs que o banco vai ter, para a PO avaliar as telas antes das migrations.
 * Nada aqui toca o banco. Nomes de pessoas são inventados.
 * Os nomes de RPC aqui são o CONTRATO que o banco tem que cumprir.
 * ========================================================================== */
(() => {
  if (!new URLSearchParams(location.search).has('demo')) return;

  const hoje = () => new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
  const diasAtras = n => { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().slice(0, 10); };

  // Lista de documentos de exemplo. A real vem do cadastro que o RH mantém.
  const ITENS = [
    { codigo: 'RG',    nome: 'RG (frente e verso)',            para: 'titular', obrigatorio: true,  ajuda: 'Foto nítida, sem reflexo.' },
    { codigo: 'CPF',   nome: 'CPF',                            para: 'titular', obrigatorio: true,  ajuda: 'Se o número estiver no RG, mande o RG de novo.' },
    { codigo: 'CTPS',  nome: 'Carteira de trabalho digital',   para: 'titular', obrigatorio: true,  ajuda: 'Print da tela do aplicativo.' },
    { codigo: 'RES',   nome: 'Comprovante de residência',      para: 'titular', obrigatorio: true,  ajuda: 'Conta de luz, água ou telefone dos últimos 3 meses.' },
    { codigo: 'FOTO',  nome: 'Foto 3x4',                       para: 'titular', obrigatorio: true,  ajuda: 'Fundo claro, rosto de frente.' },
    { codigo: 'CNH',   nome: 'CNH (frente e verso)',           para: 'titular', obrigatorio: true,  ajuda: 'Só se você tem carteira de motorista.', condicao: 'cnh' },
    { codigo: 'CERT',  nome: 'Certidão de casamento',          para: 'conjuge', obrigatorio: true,  ajuda: '' },
    { codigo: 'NASC',  nome: 'Certidão de nascimento do filho', para: 'filho',  obrigatorio: true,  ajuda: 'Um arquivo por filho.' },
  ];

  const CHAVE = 'sigmarh_demo_v2';   // v2: formato da mt26
  const S0 = {
    acessos: [
      { codigo: 'AB12CD34', nome: 'CARLOS ALBERTO MENDES', funcao: 'SUPERVISOR DE CALDEIRARIA', pode_pedir: true,  pode_aprovar: false },
      { codigo: 'EF56GH78', nome: 'RENATA DUARTE LIMA',    funcao: 'COORDENADORA DE MANUTENÇÃO', pode_pedir: true,  pode_aprovar: false },
      { codigo: 'JK90LM12', nome: 'PAULO ROBERTO SALES',    funcao: 'GERENTE DO CONTRATO',       pode_pedir: false, pode_aprovar: true },
      { codigo: 'NP34QR56', nome: 'MARCOS VIEIRA COSTA',    funcao: 'ENCARREGADO DE SOLDA',      pode_pedir: false, pode_aprovar: false },
    ],
    reqs: [
      { numero: 'RP-2026-0007', nome: 'JOSÉ CARLOS DE SOUZA',   funcao: 'SOLDADOR',      supervisor: 'CARLOS ALBERTO MENDES', etapa: 'aguardando_gerente', desde: diasAtras(1), telefone: '21988887777', motivo_vaga: 'Aumento de quadro' },
      { numero: 'RP-2026-0006', nome: 'ANA PAULA FERREIRA',     funcao: 'CALDEIREIRO',   supervisor: 'CARLOS ALBERTO MENDES', etapa: 'aguardando_gerente', desde: diasAtras(2), telefone: '21977776666', motivo_vaga: 'Substituição' },
      { numero: 'RP-2026-0005', nome: 'LUCAS MARTINS ROCHA',    funcao: 'MONTADOR',      supervisor: 'RENATA DUARTE LIMA',    etapa: 'aprovada',           desde: diasAtras(1), telefone: '21966665555', motivo_vaga: 'Aumento de quadro' },
      { numero: 'RP-2026-0004', nome: 'FERNANDA ALVES',         funcao: 'TÉCNICO DE SEGURANÇA', supervisor: 'RENATA DUARTE LIMA', etapa: 'link_enviado', desde: diasAtras(3), telefone: '21955554444', enviados: 2, total: 5 },
      { numero: 'RP-2026-0003', nome: 'RAFAEL GOMES TEIXEIRA',  funcao: 'SOLDADOR',      supervisor: 'CARLOS ALBERTO MENDES', etapa: 'conferir',           desde: diasAtras(1), telefone: '21944443333', enviados: 6, total: 6 },
      { numero: 'RP-2026-0002', nome: 'BRUNO CARDOSO',          funcao: 'PINTOR',        supervisor: 'RENATA DUARTE LIMA',    etapa: 'recusada',           desde: diasAtras(4), telefone: '21933332222', motivo_recusa: 'Vaga já preenchida por remanejamento.' },
    ],
    candidatos: [
      { codigo: 'ZX11YW22', nome: 'ANTÔNIO PEREIRA',  funcao: 'SOLDADOR',    desde: diasAtras(20), tem_matricula_petrobras: false, origem: 'efetivo antigo' },
      { codigo: 'ZX33YW44', nome: 'MARIA DAS GRAÇAS', funcao: 'CALDEIREIRO', desde: diasAtras(18), tem_matricula_petrobras: true,  origem: 'efetivo antigo' },
    ],
    contrato: [
      { codigo: 'QQ55RR66', nome: 'JOÃO BATISTA NUNES', funcao: 'ENCARREGADO', entrada: diasAtras(40), pode_campo: true,  motivos: [] },
      { codigo: 'QQ77RR88', nome: 'SANDRA REGINA LOPES', funcao: 'SOLDADOR',   entrada: diasAtras(25), pode_campo: false, motivos: ['sem_pin'] },
    ],
    sairam: [
      { codigo: 'TT99UU00', nome: 'ROBERTO SILVA', funcao: 'MONTADOR', entrada: diasAtras(90), fim: diasAtras(10), motivo: 'Fim da parada' },
    ],
    conferencia: {
      'RP-2026-0003': {
        dados: { calcado: '41', uniforme: 'G', cnh: 'Sim, categoria B', parente_gcb: 'Não', indicado_por: 'CARLOS ALBERTO MENDES' },
        itens: [
          { codigo: 'RG', nome: 'RG (frente e verso)', para: 'titular', situacao: 'enviado' },
          { codigo: 'CPF', nome: 'CPF', para: 'titular', situacao: 'enviado' },
          { codigo: 'CTPS', nome: 'Carteira de trabalho digital', para: 'titular', situacao: 'enviado' },
          { codigo: 'RES', nome: 'Comprovante de residência', para: 'titular', situacao: 'enviado' },
          { codigo: 'FOTO', nome: 'Foto 3x4', para: 'titular', situacao: 'enviado' },
          { codigo: 'NASC#1', nome: 'Certidão de nascimento do filho (1º filho)', para: 'filho', situacao: 'enviado' },
        ]
      }
    },
    minhas: [],
    tipos: ITENS.map((t, n) => Object.assign({ regra_rh: '', sensivel: false, ordem: (n + 1) * 10, ativo: true, condicao: null }, t)),
    candidato: {
      nome: 'JOSÉ CARLOS DE SOUZA', funcao: 'SOLDADOR', prazo: diasAtras(-7), concluido: false,
      dados: {}, conjuge: null, filhos: 0,
      enviados: {}
    }
  };

  /* As telas da demonstração compartilham o mesmo estado pelo navegador:
     o pedido feito no celular do supervisor aparece para o gerente e para o RH. */
  let S;
  try { S = JSON.parse(localStorage.getItem(CHAVE) || 'null'); } catch (e) { S = null; }
  if (!S || !S.reqs) S = JSON.parse(JSON.stringify(S0));
  const salvar = () => { try { localStorage.setItem(CHAVE, JSON.stringify(S)); } catch (e) {} };

  const fila = etapa => {
    if (['aguardando_gerente','aprovada','link_enviado','conferir','recusada'].includes(etapa))
      return S.reqs.filter(r => r.etapa === etapa);
    if (etapa === 'candidato') return S.candidatos;
    if (etapa === 'contrato') return S.contrato;
    if (etapa === 'saiu') return S.sairam;
    return [];
  };
  const acharReq = n => { const r = S.reqs.find(x => x.numero === n); if (!r) throw new Error('Requisição não encontrada.'); return r; };
  // Como no banco: PIN errado não é exceção, volta { ok:false, motivo, mensagem }.
  const pinRecusado = p => p === '1234' ? null
    : { ok: false, motivo: 'incorreto', mensagem: 'PIN incorreto. Na demonstração o PIN é 1234.' };
  const tiposAtivos = () => S.tipos.filter(t => t.ativo).sort((a, b) => a.ordem - b.ordem);

  const API = {
    // ── RH (com login) ──
    rh_painel: () => ({
      aguardando_gerente: fila('aguardando_gerente').length, aprovada: fila('aprovada').length,
      link_enviado: fila('link_enviado').length, conferir: fila('conferir').length,
      candidato: S.candidatos.length, contrato: S.contrato.length, saiu: S.sairam.length,
      recusada: fila('recusada').length
    }),
    rh_fila: ({ p_etapa }) => fila(p_etapa),
    rh_gerar_link: ({ p_numero }) => {
      const r = acharReq(p_numero);
      r.etapa = 'link_enviado'; r.enviados = 0; r.total = 5; r.desde = hoje();
      S.candidato = { numero: r.numero, nome: r.nome, funcao: r.funcao, prazo: diasAtras(-7), concluido: false,
                      dados: {}, conjuge: null, filhos: 0, enviados: {}, tem_cpf: false };
      return { link: location.origin + location.pathname.replace(/[^/]*$/, '') + 'documentos.html?k=demo&demo=1',
               telefone: r.telefone, nome: r.nome, prazo_dias: 7 };
    },
    rh_conferencia: ({ p_numero }) => {
      const r = acharReq(p_numero);
      const c = S.conferencia[p_numero] || { dados: {}, itens: [] };
      return { numero: r.numero, nome: r.nome, funcao: r.funcao, supervisor: r.supervisor, ...c };
    },
    rh_doc_decidir: ({ p_numero, p_item, p_aprovar, p_motivo }) => {
      if (!p_aprovar && !(p_motivo || '').trim()) throw new Error('Escreva o motivo da recusa. A pessoa vai ver.');
      const it = S.conferencia[p_numero].itens.find(i => i.codigo === p_item);
      it.situacao = p_aprovar ? 'aprovado' : 'recusado'; it.motivo = p_aprovar ? null : p_motivo;
      if (!p_aprovar) {   // como no banco: volta para a pessoa trocar, com o link valendo mais 7 dias
        const r = acharReq(p_numero); r.etapa = 'link_enviado'; r.desde = hoje();
        if (S.candidato.numero === p_numero) { S.candidato.concluido = false; S.candidato.prazo = diasAtras(-7); }
      }
      return { ok: true };
    },
    rh_aprovar_admissao: ({ p_numero }) => {
      const r = acharReq(p_numero);
      if (r.etapa !== 'conferir') throw new Error('Este pedido não está em conferência.');
      const pend = S.conferencia[p_numero].itens.filter(i => i.obrigatorio !== false && i.situacao !== 'aprovado');
      if (pend.length) throw new Error(`Ainda há ${pend.length} documento(s) sem aprovação.`);
      S.reqs = S.reqs.filter(x => x !== r);
      S.candidatos.unshift({ codigo: 'NV' + Math.floor(Math.random() * 1e6), nome: r.nome, funcao: r.funcao,
        desde: hoje(), tem_matricula_petrobras: false, origem: r.numero });
      return { ok: true, nome: r.nome, telefone: r.telefone, cadastro_existente: false,
               token_treinamento: 'DEMONSTRACAO' + Math.floor(Math.random() * 1e6) };
    },
    rh_mobilizar: ({ p_codigo, p_entrada, p_matricula }) => {
      const i = S.candidatos.findIndex(c => c.codigo === p_codigo);
      const c = S.candidatos[i];
      if (!c.tem_matricula_petrobras && !p_matricula) throw new Error('Falta a matrícula Petrobras. Sem ela a pessoa não pode ser mobilizada.');
      S.candidatos.splice(i, 1);
      S.contrato.unshift({ codigo: c.codigo, nome: c.nome, funcao: c.funcao, entrada: p_entrada, pode_campo: false, motivos: ['sem_pin'] });
      return { ok: true };
    },
    rh_desmobilizar: ({ p_codigo, p_fim, p_motivo }) => {
      if (!p_motivo || p_motivo.replace(/[^a-zà-ú]/gi, '').length < 10) throw new Error('Escreva o motivo da saída (pelo menos 10 letras).');
      const i = S.contrato.findIndex(c => c.codigo === p_codigo);
      const c = S.contrato.splice(i, 1)[0];
      S.sairam.unshift({ codigo: c.codigo, nome: c.nome, funcao: c.funcao, entrada: c.entrada, fim: p_fim, motivo: p_motivo });
      return { ok: true };
    },
    rh_acessos: () => S.acessos,
    rh_doc_tipos_listar: () => S.tipos.slice().sort((a, b) => (b.ativo - a.ativo) || (a.ordem - b.ordem)),
    rh_doc_tipo_salvar: ({ p_dados }) => {
      const cod = String(p_dados.codigo || '').trim().toUpperCase();
      if (!/^[A-Z0-9_]{2,20}$/.test(cod)) throw new Error('Código com 2 a 20 letras ou números, sem espaço (ex.: RG, CTPS, ASO).');
      if (String(p_dados.nome || '').trim().length < 2) throw new Error('Escreva o nome do documento.');
      const t = S.tipos.find(x => x.codigo === cod);
      const novo = Object.assign({ para: 'titular', condicao: null, obrigatorio: true, ajuda: '', regra_rh: '',
        sensivel: false, ordem: 100, ativo: true }, t || {}, p_dados, { codigo: cod, nome: String(p_dados.nome).trim() });
      if (t) Object.assign(t, novo); else S.tipos.push(novo);
      return { ok: true, codigo: cod };
    },
    rh_acesso_definir: ({ p_codigo, p_papel, p_ativo }) => {
      const a = S.acessos.find(x => x.codigo === p_codigo);
      a[p_papel === 'aprovar' ? 'pode_aprovar' : 'pode_pedir'] = !!p_ativo;
      return { ok: true };
    },

    // ── Supervisor (link pessoal + PIN) ──
    req_quem_sou: () => ({ nome: 'CARLOS ALBERTO MENDES', funcao: 'SUPERVISOR DE CALDEIRARIA', pode_pedir: true, pode_aprovar: false }),
    req_opcoes: () => ({
      cargos: ['SOLDADOR', 'CALDEIREIRO', 'MONTADOR', 'AJUDANTE', 'PINTOR', 'TÉCNICO DE SEGURANÇA'],
      locais: ['033-REDUC'],
      areas: ['Caldeiraria', 'Solda', 'Montagem', 'SMS'],
      efetivo: S.contrato.map(c => ({ codigo: c.codigo, nome: c.nome, funcao: c.funcao }))
    }),
    req_criar: ({ p_pin, p_dados }) => {
      const nao = pinRecusado(p_pin); if (nao) return nao;
      S.seq = (S.seq || 10) + 1;
      const numero = 'RP-2026-00' + S.seq;
      const sub = (S.contrato.find(c => c.codigo === p_dados.substituido_codigo) || {});
      S.reqs.unshift({ numero, nome: p_dados.candidato_nome, funcao: p_dados.cargo, supervisor: 'CARLOS ALBERTO MENDES',
        etapa: 'aguardando_gerente', desde: hoje(), telefone: p_dados.candidato_whatsapp, motivo_vaga: p_dados.motivo,
        dados_rp: Object.assign({}, p_dados, { substituido_nome: sub.nome || null }), feito_aqui: true });
      return { ok: true, numero };
    },
    req_minhas: () => S.reqs.filter(r => r.supervisor === 'CARLOS ALBERTO MENDES'),

    // ── Gerente (link pessoal + PIN) ──
    ger_quem_sou: () => ({ nome: 'PAULO ROBERTO SALES', funcao: 'GERENTE DO CONTRATO', pode_aprovar: true }),
    ger_painel: () => {
      const por = {};
      S.reqs.forEach(r => {
        const g = por[r.supervisor] || (por[r.supervisor] = { supervisor: r.supervisor, aguardando: 0, aprovadas: 0, recusadas: 0, requisicoes: [] });
        if (r.etapa === 'aguardando_gerente') { g.aguardando++; g.requisicoes.push(r); }
        else if (r.etapa === 'recusada') g.recusadas++;
        else g.aprovadas++;
      });
      return Object.values(por).sort((a, b) => b.aguardando - a.aguardando);
    },
    ger_detalhe: ({ p_numero }) => {
      const r = acharReq(p_numero);
      const d = r.dados_rp;
      if (d) return { ...r, tipo: d.tipo, contrato: d.contrato === 'Outro' ? d.contrato_detalhe : d.contrato,
        jornada: d.jornada, local: d.local, area: d.area, recrutamento: d.recrutamento, formacao: d.formacao,
        atividades: d.atividades, substituido: d.substituido_nome };
      return { ...r, tipo: 'Efetivo', contrato: 'Experiência 90 dias', jornada: '1º turno', local: '033-REDUC',
               area: 'Caldeiraria', recrutamento: 'Externo', formacao: 'Ensino médio',
               atividades: 'Soldagem de tubulação em parada de manutenção.',
               substituido: r.motivo_vaga === 'Substituição' ? 'ROBERTO SILVA (MONTADOR), saiu em ' + diasAtras(10) : null };
    },
    ger_decidir: ({ p_pin, p_numero, p_aprovar, p_motivo }) => {
      const nao = pinRecusado(p_pin); if (nao) return nao;
      const r = acharReq(p_numero);
      if (!p_aprovar && (!p_motivo || p_motivo.trim().length < 5)) throw new Error('Escreva o motivo da recusa.');
      r.etapa = p_aprovar ? 'aprovada' : 'recusada'; r.motivo_recusa = p_motivo || null;
      return { ok: true };
    },

    // ── Candidato (link de documentação) ──
    doc_abrir: () => ({
      nome: S.candidato.nome, funcao: S.candidato.funcao, prazo: S.candidato.prazo, concluido: S.candidato.concluido,
      dados: S.candidato.dados, conjuge: S.candidato.conjuge, filhos: S.candidato.filhos,
      tem_cpf: !!S.candidato.tem_cpf,
      itens: tiposAtivos(),
      // situação de cada envio, incluindo o que o RH recusou e o motivo
      envios: (() => {
        const conf = (S.conferencia[S.candidato.numero] || {}).itens || [];
        return Object.fromEntries(Object.keys(S.candidato.enviados).map(k => {
          const c = conf.find(x => x.codigo === k);
          return [k, c && !S.candidato.reenviado?.[k] ? { situacao: c.situacao, motivo: c.motivo || null } : { situacao: 'enviado' }];
        }));
      })()
    }),
    doc_salvar_dados: ({ p_dados }) => {
      // o CPF entra no banco e nunca volta para a tela
      if (p_dados.cpf) { S.candidato.tem_cpf = true; p_dados = Object.assign({}, p_dados); delete p_dados.cpf; }
      Object.assign(S.candidato.dados, p_dados);
      if ('conjuge' in p_dados) S.candidato.conjuge = p_dados.conjuge;
      if ('filhos' in p_dados) S.candidato.filhos = p_dados.filhos; return { ok: true }; },
    doc_enviar_arquivo: ({ p_item }) => {
      const conf = ((S.conferencia[S.candidato.numero] || {}).itens || []).find(x => x.codigo === p_item);
      if (conf && conf.situacao === 'aprovado') throw new Error('Este documento já foi aprovado pelo RH.');
      S.candidato.enviados[p_item] = true;
      (S.candidato.reenviado = S.candidato.reenviado || {})[p_item] = true;
      const r = S.reqs.find(x => x.numero === S.candidato.numero);
      if (r) r.enviados = Object.keys(S.candidato.enviados).length;
      return { ok: true };
    },
    doc_concluir: () => {
      const c = S.candidato; c.concluido = true;
      const r = S.reqs.find(x => x.numero === c.numero);
      if (r) {
        const nomes = Object.fromEntries(S.tipos.map(i => [i.codigo, i.nome]));
        const obrig = Object.fromEntries(S.tipos.map(i => [i.codigo, i.obrigatorio]));
        const antes = (S.conferencia[r.numero] || {}).itens || [];
        r.etapa = 'conferir'; r.desde = hoje(); r.enviados = Object.keys(c.enviados).length;
        const d = c.dados;
        S.conferencia[r.numero] = {
          dados: { calcado: d.calcado, uniforme: d.uniforme, cnh: d.cnh === 'Sim' ? 'Sim, categoria ' + (d.cnh_categoria || '') : 'Não',
                   parente_gcb: d.parente === 'Sim' ? d.parente_nome : 'Não', indicado_por: d.indicado === 'Sim' ? d.indicado_nome : 'Não' },
          itens: Object.keys(c.enviados).map(k => { const [base, n] = k.split('#');
            const a = antes.find(x => x.codigo === k);   // o que o RH já aprovou e não foi trocado continua aprovado
            const manter = a && a.situacao === 'aprovado' && !(c.reenviado || {})[k];
            return { codigo: k, nome: (nomes[base] || base) + (n ? ` (${n}º filho)` : ''), para: n ? 'filho' : 'titular',
                     obrigatorio: obrig[base] !== false, situacao: manter ? 'aprovado' : 'enviado', motivo: null }; })
        };
      }
      c.reenviado = {};
      return { ok: true };
    },
    demo_reiniciar: () => { try { localStorage.removeItem(CHAVE); } catch (e) {} S = JSON.parse(JSON.stringify(S0)); return { ok: true }; },
  };

  // toda chamada grava o estado, para a próxima tela ver o que mudou
  window.SigmaRHDemo = Object.fromEntries(Object.entries(API).map(([k, f]) =>
    [k, args => { const r = f(args); salvar(); return r; }]));
})();
