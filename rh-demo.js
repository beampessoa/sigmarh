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
    { codigo: 'CERT',  nome: 'Certidão de casamento',          para: 'conjuge', obrigatorio: true,  ajuda: '' },
    { codigo: 'NASC',  nome: 'Certidão de nascimento do filho', para: 'filho',  obrigatorio: true,  ajuda: 'Um arquivo por filho.' },
  ];

  const S = {
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
          { codigo: 'NASC#1', nome: 'Certidão de nascimento do filho (1)', para: 'filho', situacao: 'enviado' },
        ]
      }
    },
    minhas: [],
    candidato: {
      nome: 'JOSÉ CARLOS DE SOUZA', funcao: 'SOLDADOR', prazo: diasAtras(-7), concluido: false,
      dados: {}, conjuge: null, filhos: 0,
      enviados: {}
    }
  };

  const fila = etapa => {
    if (['aguardando_gerente','aprovada','link_enviado','conferir','recusada'].includes(etapa))
      return S.reqs.filter(r => r.etapa === etapa);
    if (etapa === 'candidato') return S.candidatos;
    if (etapa === 'contrato') return S.contrato;
    if (etapa === 'saiu') return S.sairam;
    return [];
  };
  const acharReq = n => { const r = S.reqs.find(x => x.numero === n); if (!r) throw new Error('Requisição não encontrada.'); return r; };
  const pinOk = p => { if (p !== '1234') throw new Error('PIN incorreto. Na demonstração o PIN é 1234.'); };

  window.SigmaRHDemo = {
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
      return { link: location.origin + location.pathname.replace(/[^/]*$/, '') + 'documentos.html?k=demo&demo=1',
               telefone: r.telefone, nome: r.nome, prazo_dias: 7 };
    },
    rh_conferencia: ({ p_numero }) => {
      const r = acharReq(p_numero);
      const c = S.conferencia[p_numero] || { dados: {}, itens: [] };
      return { numero: r.numero, nome: r.nome, funcao: r.funcao, supervisor: r.supervisor, ...c };
    },
    rh_doc_decidir: ({ p_numero, p_item, p_aprovar, p_motivo }) => {
      const it = S.conferencia[p_numero].itens.find(i => i.codigo === p_item);
      it.situacao = p_aprovar ? 'aprovado' : 'recusado'; it.motivo = p_aprovar ? null : p_motivo;
      return { ok: true };
    },
    rh_aprovar_admissao: ({ p_numero }) => {
      const r = acharReq(p_numero);
      const pend = S.conferencia[p_numero].itens.filter(i => i.situacao !== 'aprovado');
      if (pend.length) throw new Error(`Ainda há ${pend.length} documento(s) sem aprovação.`);
      S.reqs = S.reqs.filter(x => x !== r);
      S.candidatos.unshift({ codigo: 'NV' + Math.floor(Math.random() * 1e6), nome: r.nome, funcao: r.funcao,
        desde: hoje(), tem_matricula_petrobras: false, origem: r.numero });
      return { ok: true };
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
      pinOk(p_pin);
      const numero = 'RP-2026-00' + (10 + S.minhas.length);
      S.minhas.unshift({ numero, nome: p_dados.candidato_nome, funcao: p_dados.cargo, etapa: 'aguardando_gerente', desde: hoje() });
      return { numero };
    },
    req_minhas: () => S.minhas.concat(S.reqs.filter(r => r.supervisor === 'CARLOS ALBERTO MENDES')),

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
      return { ...r, tipo: 'Efetivo', contrato: 'Experiência 90 dias', jornada: '1º turno', local: '033-REDUC',
               area: 'Caldeiraria', recrutamento: 'Externo', formacao: 'Ensino médio',
               atividades: 'Soldagem de tubulação em parada de manutenção.',
               substituido: r.motivo_vaga === 'Substituição' ? 'ROBERTO SILVA (MONTADOR), saiu em ' + diasAtras(10) : null };
    },
    ger_decidir: ({ p_pin, p_numero, p_aprovar, p_motivo }) => {
      pinOk(p_pin);
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
      itens: ITENS,
      envios: Object.fromEntries(Object.keys(S.candidato.enviados).map(k => [k, { situacao: 'enviado' }]))
    }),
    doc_salvar_dados: ({ p_dados }) => {
      // o CPF entra no banco e nunca volta para a tela
      if (p_dados.cpf) { S.candidato.tem_cpf = true; p_dados = Object.assign({}, p_dados); delete p_dados.cpf; }
      Object.assign(S.candidato.dados, p_dados);
      if ('conjuge' in p_dados) S.candidato.conjuge = p_dados.conjuge;
      if ('filhos' in p_dados) S.candidato.filhos = p_dados.filhos; return { ok: true }; },
    doc_enviar_arquivo: ({ p_item }) => { S.candidato.enviados[p_item] = true; return { ok: true }; },
    doc_concluir: () => { S.candidato.concluido = true; return { ok: true }; },
  };
})();
