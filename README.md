# Sigma RH (rh.sigmacode.com.br)

Front do Sigma RH: HTML, CSS e JS puros, sem build. Banco: Supabase do E-SIGMA
(projeto kiwiykgzogcxiseynzyy), schema `sigmatr`, tudo por RPC. Nenhuma Serverless
Function da Vercel. O upload de documento vai por uma Edge Function do Supabase.

**Para ver as telas sem banco:** abra qualquer página com `?demo=1`
(ex.: `shell.html?demo=1`). Dados de mentira, nada é gravado. PIN da demonstração: 1234.

## Páginas

| Página | Quem usa | Como entra |
|---|---|---|
| `index.html` | todos | porta: manda para o painel ou para o login |
| `login.html`, `reset-senha.html` | RH, admin | e-mail e senha; papel `rh` ou `admin` em `roles.sigmatr` |
| `shell.html` | RH | **Gestão do RH**: o caminho de cada contratação, da requisição ao contrato |
| `acessos.html` | RH | marca quem pode pedir e quem pode aprovar contratação |
| `demonstrativo.html` | quem for apresentar | botão **Demonstração** no menu: o caminho todo com dados de mentira, sem login e sem tocar no banco |
| `requisicao-folha.html` | RH | FOR-RH-02 em folha A4 com as assinaturas por PIN; botão **Requisição (PDF)** em cada linha da Gestão do RH. Diretoria e salário em branco (D23, D24) |
| `lista-documentos.html` | RH | a lista de documentos que o candidato vê no link (obrigatório, só com CNH, cônjuge, filho) |
| `requisicao.html` | supervisor, coordenador | link pessoal do treinamento (`?k=`) e PIN |
| `aprovacao.html` | gerente | link pessoal do treinamento (`?k=`) e PIN |
| `documentos.html` | candidato | link de documentação gerado pelo RH (`?k=`) |
| `rh-ui.js` | todas | casca, guarda de papel, PIN, janelas, erros em português |
| `rh-demo.js` | todas | dados do modo demonstração; também é o contrato das RPCs |

## Caminho de uma contratação

1. Supervisor faz a requisição (FOR-RH-02) e assina com PIN.
2. Gerente aprova ou recusa com PIN. Diretoria assina o PDF fora do sistema.
3. RH gera o link de documentação e manda no WhatsApp.
4. Candidato responde os dados dele e envia os documentos (Drive do RH).
5. RH confere documento por documento e aprova a admissão: a pessoa vira candidata e treina.
6. RH coloca no contrato (data de entrada e matrícula Petrobras).

## Para colocar no ar

1. Banco: migrations do Sigma RH (mt24, mt25 e as da requisição/documentos), só com aprovação.
2. Edge Function `rh-doc-upload` (código em `edge/rh-doc-upload/index.ts`), com **Verify JWT desligado**
   e o segredo `GOOGLE_SA_JSON`. Antes de publicar, trocar `RAIZ_RH` pelo id da pasta do Drive do RH
   (a conta de serviço precisa ser editora dela). POST: o candidato envia pelo link. GET: o RH abre o
   arquivo com o JWT da sessão; com a chave anon a resposta é 403.
   Cadastrar a lista em `lista-documentos.html` antes do primeiro link: com a lista vazia o candidato não termina.
3. Vercel: projeto novo para este repositório, domínio `rh.sigmacode.com.br`;
   DNS: CNAME `rh` para `cname.vercel-dns.com`.
4. Supabase, Authentication, URL Configuration: `https://rh.sigmacode.com.br/**` em Redirect URLs.
5. `rh-ui.js`: conferir `URL_TREINAMENTO` (porta do link pessoal do treinamento).
6. Contas do RH: `raw_app_meta_data` = `{"roles": {"sigmatr": "rh"}}`.
