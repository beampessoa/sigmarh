/* ============================================================================
 * rh-demo-efetivo.js · demonstração da importação do efetivo (?demo=1)
 *
 * Carregar depois de rh-demo.js. Responde as duas RPCs que a importação usa,
 * com os mesmos nomes e formatos que o banco vai ter que cumprir (mt27, a escrever):
 *
 *   rh_importar_efetivo_previa(p_linhas jsonb)
 *     Compara cada linha com o cadastro, sem gravar. Devolve por linha:
 *     { linha, cadastro: 'nova'|'existente', nome_difere, funcao_ok,
 *       vinculo: 'novo'|'igual'|'conflito', motivo }. Nunca devolve CPF.
 *
 *   rh_importar_efetivo(p_linhas jsonb, p_arquivo text)
 *     Grava. Pessoa nova entra como candidata; cada linha vira um vínculo com
 *     origem 'importacao'; o espelho calcula mobilizado ou desmobilizado.
 *     Devolve contagens e a lista de linhas recusadas com o motivo.
 *
 * Cada linha enviada: { linha, cpf, nome, funcao, entrada, fim, motivo,
 *   matricula_petrobras, matricula_gcb, empresa }. Datas em aaaa-mm-dd; fim é o
 *   PRIMEIRO dia fora do contrato (a tela já converteu).
 * CPFs e nomes daqui são inventados.
 * ========================================================================== */
(() => {
  if (!new URLSearchParams(location.search).has('demo')) return;

  const CHAVE = 'sigmarh_demo_efetivo_v1';
  const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ').trim();

  // Funções cadastradas (nomes reais de sigmatr.funcoes, só os nomes). Apelidos como em funcao_apelido.
  const FUNCOES = ['Caldeireiro', 'Montador de Andaime', 'Ajudante de Limpeza', 'Supervisor de Montagem', 'Soldador TIG/ER',
    'Caldeireiro Alpinista', 'Eletricista', 'Técnico de Segurança', 'Inspetor de ENDs', 'Almoxarife', 'Auxiliar de Almoxarifado',
    'Técnico de Planejamento', 'Auxiliar de Movimentação de Cargas', 'Auxiliar de Planejamento', 'Supervisor Geral',
    'Auxiliar de Serviços Gerais', 'Inspetor de ENDs Alpinista', 'Auxiliar de Materiais', 'Coordenador de Planejamento',
    'Técnico de Documentação', 'Motorista Operador de Munck', 'Motorista Van', 'Assistente Administrativo',
    'Coordenador de Controle da Qualidade', 'Supervisor de Suprimentos', 'Auxiliar Administrativo', 'Projetista',
    'Coordenador de Produção', 'Encarregado de Limpeza', 'Supervisor de Andaime', 'Gerente de Contrato', 'Soldador Alpinista',
    'Técnico de Materiais', 'Inspetor de PM', 'Auxiliar de Suprimentos'];
  const APELIDOS = { 'soldador': 'Soldador TIG/ER', 'montador andaime': 'Montador de Andaime', 'tecnico seguranca': 'Técnico de Segurança',
    'aux almoxarifado': 'Auxiliar de Almoxarifado' };
  const funcaoOk = f => { const n = norm(f); return FUNCOES.some(x => norm(x) === n) || !!APELIDOS[n]; };

  // CPF de mentira com dígito verificador certo, a partir de 9 dígitos
  function cpfDe(base) {
    const d = String(base).padStart(9, '0').split('').map(Number);
    const dv = arr => { const s = arr.reduce((a, n, i) => a + n * (arr.length + 1 - i), 0); const r = (s * 10) % 11; return r === 10 ? 0 : r; };
    d.push(dv(d)); d.push(dv(d)); return d.join('');
  }

  // Cadastro já existente (como os 198 de hoje: candidatos, sem vínculo), mais um caso com vínculo igual
  const EXISTENTES0 = {
    [cpfDe(123456781)]: { nome: 'JOÃO BATISTA NUNES', vinculos: [] },
    [cpfDe(234567812)]: { nome: 'SANDRA REGINA LOPES', vinculos: [] },
    [cpfDe(345678123)]: { nome: 'ADRIANO SOUZA MELO', vinculos: [] },
    [cpfDe(456781234)]: { nome: 'CLAUDIO RAMOS PINTO', vinculos: [] },          // planilha traz "CLÁUDIO R. PINTO"
    [cpfDe(567812345)]: { nome: 'DIEGO FERNANDES ALVES', vinculos: [{ entrada: '2026-07-16', fim: null }] },
  };
  let S;
  try { S = JSON.parse(localStorage.getItem(CHAVE) || 'null'); } catch (e) { S = null; }
  if (!S || !S.cad) S = { cad: JSON.parse(JSON.stringify(EXISTENTES0)), importacoes: 0 };
  const salvar = () => { try { localStorage.setItem(CHAVE, JSON.stringify(S)); } catch (e) {} };

  const sobrepoe = (a, b) => a.entrada < (b.fim || '9999-12-31') && b.entrada < (a.fim || '9999-12-31');

  function avaliar(l) {
    const c = S.cad[l.cpf];
    const out = { linha: l.linha, cadastro: c ? 'existente' : 'nova', nome_difere: !!(c && norm(c.nome) !== norm(l.nome)),
      funcao_ok: funcaoOk(l.funcao), vinculo: 'novo', motivo: null };
    if (!out.funcao_ok) { out.vinculo = 'conflito'; out.motivo = `A função "${l.funcao}" não está cadastrada. O SGI precisa criar a função e a matriz antes.`; return out; }
    if (c) {
      const v = { entrada: l.entrada, fim: l.fim || null };
      if (c.vinculos.some(x => x.entrada === v.entrada && (x.fim || null) === v.fim)) { out.vinculo = 'igual'; return out; }
      const choque = c.vinculos.find(x => sobrepoe(x, v));
      if (choque) { out.vinculo = 'conflito';
        out.motivo = `Já existe um período no cadastro que começa em ${choque.entrada.split('-').reverse().join('/')} e cruza com este. Corrija no cadastro da pessoa antes.`; }
    }
    return out;
  }

  const API = {
    rh_importar_efetivo_previa: ({ p_linhas }) => (p_linhas || []).map(avaliar),
    rh_importar_efetivo: ({ p_linhas }) => {
      const r = { ok: true, pessoas_criadas: 0, pessoas_existentes: 0, vinculos_criados: 0, vinculos_iguais: 0, recusadas: [] };
      const vistas = new Set();
      (p_linhas || []).forEach(l => {
        const a = avaliar(l);
        if (a.vinculo === 'conflito') { r.recusadas.push({ linha: l.linha, motivo: a.motivo }); return; }
        if (!S.cad[l.cpf]) { S.cad[l.cpf] = { nome: l.nome, vinculos: [] }; r.pessoas_criadas++; vistas.add(l.cpf); }
        else if (!vistas.has(l.cpf)) { r.pessoas_existentes++; vistas.add(l.cpf); }
        if (a.vinculo === 'igual') { r.vinculos_iguais++; return; }
        S.cad[l.cpf].vinculos.push({ entrada: l.entrada, fim: l.fim || null }); r.vinculos_criados++;
      });
      S.importacoes++; r.importacao = 'IMP-2026-' + String(S.importacoes).padStart(4, '0');
      const pessoas = Object.values(S.cad);
      r.no_contrato_hoje = pessoas.filter(p => p.vinculos.some(v => !v.fim)).length;
      r.sairam = pessoas.filter(p => p.vinculos.length && p.vinculos.every(v => v.fim)).length;
      r.candidatas = pessoas.filter(p => !p.vinculos.length).length;
      return r;
    },
    // Avançado: quem está no contrato hoje e não veio na planilha (só informa, não desmobiliza)
    rh_efetivo_fora_da_planilha: ({ p_cpfs }) => {
      const set = new Set(p_cpfs || []);
      return Object.entries(S.cad).filter(([cpf, p]) => !set.has(cpf) && p.vinculos.some(v => !v.fim)).map(([, p]) => ({ nome: p.nome }));
    },
    demo_efetivo_reiniciar: () => { try { localStorage.removeItem(CHAVE); } catch (e) {} S = { cad: JSON.parse(JSON.stringify(EXISTENTES0)), importacoes: 0 }; return { ok: true }; },
  };

  // Planilha de exemplo: casos bons, avisos e erros de propósito
  window.SigmaRHDemoEfetivo = {
    cpfDe,
    exemplo: () => [
      ['NOME', 'CPF', 'FUNÇÃO', 'MATRÍCULA PETROBRAS', 'EMPRESA', 'DATA ADMISSÃO', 'DATA DEMISSÃO', 'MOTIVO'],
      ['JOÃO BATISTA NUNES', cpfDe(123456781), 'Encarregado de Limpeza', '40112233', 'GCB', '16/07/2026', '', ''],
      ['SANDRA REGINA LOPES', cpfDe(234567812), 'Soldador', '40112234', 'GCB', '20/08/2026', '', ''],
      ['ADRIANO SOUZA MELO', cpfDe(345678123), 'Caldeireiro', '40112235', 'GCB', '20/08/2026', '', ''],
      ['CLÁUDIO R. PINTO', cpfDe(456781234), 'Montador de Andaime', '40112236', 'GCB', '24/08/2026', '', ''],
      ['DIEGO FERNANDES ALVES', cpfDe(567812345), 'Ajudante de Limpeza', '40112237', 'GCB', '16/07/2026', '', ''],
      ['EDSON LUIZ CARVALHO', cpfDe(678123456), 'Soldador TIG/ER', '40112238', 'GCB', '16/07/2026', '31/08/2026', 'Fim da parada da U-3400'],
      ['EDSON LUIZ CARVALHO', cpfDe(678123456), 'Soldador TIG/ER', '40112238', 'GCB', '14/09/2026', '', ''],
      ['FÁBIO HENRIQUE COSTA', cpfDe(781234567), 'Caldeireiro', '40112239', 'GCB', '20/08/26', '', ''],
      ['GILSON MARQUES DA SILVA', String(+cpfDe(12345678)), 'Caldeireiro', '40112240', 'GCB', '20/08/2026', '30/09/2026', ''],
      ['HÉLIO TAVARES BRAGA', cpfDe(812345671), 'Eletricista', '40112241', 'GCB', '02/09/2026', '', ''],
      ['IVAN PEREIRA DUTRA', cpfDe(923456781), 'Técnico de Segurança', '40112242', 'GCB', '24/08/2026', '', ''],
      ['JORGE LUÍS MACHADO', cpfDe(134567892), 'Inspetor de ENDs', '40112243', 'SEEPIL', '07/09/2026', '', ''],
      ['KLEBER ANTUNES REIS', cpfDe(245678913), 'Almoxarife', '40112244', 'GCB', '20/08/2026', '10/10/2026', 'Pedido de demissão'],
      ['LUCAS MARTINS ROCHA', cpfDe(356789124), 'Montador de Andaime', '', 'GCB', '24/08/2026', '', ''],
      ['MARCOS VIEIRA COSTA', '123.456.789-00', 'Caldeireiro', '40112246', 'GCB', '20/08/2026', '', ''],
      ['NILTON SOARES', cpfDe(467891235), 'HIDROJATISTA', '40112247', 'GCB', '24/08/2026', '', ''],
      ['OTÁVIO BRANDÃO', cpfDe(578912346), 'Caldeireiro', '40112248', 'GCB', '20/08/2026', '15/08/2026', 'Fim de contrato'],
      ['PAULO CÉSAR DIAS', cpfDe(689123457), 'Caldeireiro', '40112249', 'GCB', '20/11/2026', '', ''],
      ['RAFAEL GOMES TEIXEIRA', cpfDe(791234568), 'Soldador TIG/ER', '40112250', 'GCB', '20/08/2026', '', ''],
      ['RAFAEL GOMES TEIXEIRA', cpfDe(791234568), 'Soldador TIG/ER', '40112250', 'GCB', '01/09/2026', '', ''],
      ['SÉRGIO LIMA', cpfDe(813456790), 'Caldeireiro', '40112238', 'GCB', '20/08/2026', '', ''],
      ['TIAGO NUNES', cpfDe(924567801), 'Caldeireiro', '40112252', 'GCB', '20/08/2026', '', ''],
      ['TIAGO NUNES', cpfDe(924567801), 'Caldeireiro', '40112252', 'GCB', '20/08/2026', '', ''],
      ['', '', '', '', '', '', '', ''],
    ],
  };

  window.SigmaRHDemo = window.SigmaRHDemo || {};
  Object.entries(API).forEach(([k, f]) => { window.SigmaRHDemo[k] = args => { const r = f(args); salvar(); return r; }; });
})();
