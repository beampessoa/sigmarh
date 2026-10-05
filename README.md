# Sigma RH (rh.sigmacode.com.br)

Front do Sigma RH: HTML, CSS e JS puros, sem build. Banco: Supabase do E-SIGMA
(projeto kiwiykgzogcxiseynzyy), schema `sigmatr`, tudo por RPC.

## Arquivos

| Arquivo | O que é |
|---|---|
| `index.html` | Porta: com sessão vai ao painel, sem sessão vai ao login |
| `login.html` | E-mail e senha. Só entra quem tem papel `rh` ou `admin` em `app_metadata.roles.sigmatr` |
| `reset-senha.html` | Destino do link "Esqueci minha senha" |
| `shell.html` | Painel: números do dia e atalhos |
| `efetivo.html` | Tela em passos: lista do dia, revisão em lote, entrada, saída, correção |
| `rh-ui.js` | Casca: cabeçalho, menu, guarda de papel, toast, confirmação, erros em português |
| `vercel.json` | URLs limpas e cabeçalhos de segurança (sem cache, sem indexação, sem iframe) |

Nenhuma Serverless Function: o limite de 12 da Vercel não é tocado.

## Para colocar no ar

1. Banco: aplicar `mt24_sigma_rh_vinculos.sql` e `mt25_sigma_rh_fecho_desligado.sql`
   (só com aprovação). Sem elas, as telas abrem e mostram "Esta função ainda não foi instalada".
2. Vercel: projeto novo apontando para este repositório, sem framework, sem build.
   Em Domains, adicionar `rh.sigmacode.com.br`.
3. DNS do sigmacode.com.br: registro CNAME `rh` para `cname.vercel-dns.com`.
4. Supabase, Authentication, URL Configuration: acrescentar
   `https://rh.sigmacode.com.br/**` em Redirect URLs (senão o link de senha nova volta
   para o site errado).
5. Contas do RH: em Authentication, Users, criar o usuário e gravar em
   `raw_app_meta_data` o papel: `{"roles": {"sigmatr": "rh"}}`. O papel só vale depois
   de um novo login.
