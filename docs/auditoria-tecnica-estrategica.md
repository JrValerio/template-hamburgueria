# 📘 AUDITORIA TÉCNICA E ESTRATÉGICA

## 1. Sumário Executivo

### Escopo auditado
- Aplicação front-end React/Vite de e-commerce (catálogo + carrinho + busca), sem backend próprio no repositório.
- Avaliados: código fonte, dependências, scripts, padrão de persistência local, superfície de segurança no client e maturidade operacional.

### Diagnóstico executivo
- **Maturidade técnica atual:** MVP funcional de front-end para demo/portfólio.
- **Risco principal:** dependência de API third-party sem controle de SLA e sem estratégia de contingência.
- **Gaps críticos para SaaS:** inexistência de autenticação, autorização, billing, observabilidade, CI/CD formal, testes automatizados, governança de segurança e compliance.
- **Conclusão:** pronto para demonstração de produto; **não pronto para operação SaaS comercial** sem hardening em 0–3 meses.

### PRIORIDADE ZERO (P0)
**P0-01 — Dependência externa única da API sem fallback/controle contratual**
- **Evidência:** [`src/services/api.js:4`](../src/services/api.js) — `baseURL` hardcoded: `https://hamburgueria-kenzie-json-serve.herokuapp.com/` (Heroku, serviço de terceiros sem SLA contratual).
- **Impacto:** indisponibilidade total do catálogo, queda de conversão e risco reputacional imediato.
- **Hotfix (≤ 7 dias):**
  1. Externalizar URL via `VITE_API_BASE_URL`.
  2. Implementar timeout/retry com circuito simples no client.
  3. Adicionar payload de fallback local em caso de indisponibilidade.
  4. Exibir estado degradado com telemetria de erro.
- **Rollback plan:** feature flag `VITE_USE_STATIC_FALLBACK=true` para retornar ao catálogo estático caso nova camada de resiliência apresente regressão.

---

## 2. Riscos Críticos (≤ 7 dias)

| ID | Risco | Impacto | Mitigação | Owner | Prazo |
|---|---|---|---|---|---|
| CR-01 | API externa única sem SLA e sem fallback | Alto | Hotfix P0-01 (env var + retry + fallback) | Tech Lead FE | D+7 |
| CR-02 | Ausência de autenticação/autorização | Alto | Definir arquitetura IAM (OIDC/JWT). No curto prazo, bloquear UX de rotas premium via feature flag (enforcement real somente server-side). | Arquiteto + Security Lead | D+7 |
| CR-03 | Sem pipeline CI/CD com gates de qualidade | Alto | Criar GitHub Actions com build, lint, SAST e política de branch protection | SRE | D+5 |
| CR-04 | Sem observabilidade (logs, métricas, tracing, alertas) | Alto | Integrar Sentry + métricas Web Vitals + alerta de disponibilidade | SRE | D+7 |
| CR-05 | Persistência de carrinho apenas em localStorage | Médio/Alto | Introduzir schema validation e versionamento do estado; limpar dados inválidos | Eng. Frontend | D+4 |

---

## 3. Matriz de Risco

Impacto x Probabilidade (Alto / Médio / Baixo)

| ID | Categoria | Impacto | Probabilidade | Nível |
|---|---|---|---|---|
| R-01 | Disponibilidade API externa | Alto | Alto | Crítico |
| R-02 | Segurança (ausência IAM) | Alto | Médio | Alto |
| R-03 | Compliance/LGPD (sem política de retenção/consentimento) | Alto | Médio | Alto |
| R-04 | Financeiro (sem controle de custos/monitoramento) | Médio | Médio | Médio |
| R-05 | Performance (sem budgets/monitoramento de Web Vitals) | Médio | Médio | Médio |
| R-06 | Qualidade (sem testes automatizados) | Alto | Alto | Crítico |
| R-07 | Entrega (sem CI/CD formal) | Alto | Alto | Crítico |
| R-08 | Fraude/pagamentos (capacidade inexistente) | Alto | Baixo* | Médio |

\* Baixo no estado atual porque não há módulo de pagamento em produção neste repositório.

---

## 4. Issues Priorizadas

| ID | Descrição | Severidade | Esforço | Dependência | Owner |
|---|---|---|---|---|---|
| I-01 | Externalizar endpoint da API via variável de ambiente e fallback local | P0 | M | Nenhuma | Tech Lead FE |
| I-02 | Implementar suíte mínima de testes (unit + integração UI crítica) | P0 | M | I-01 | Eng. Frontend |
| I-03 | Adicionar CI/CD com gates (build/lint/test/SAST) | P0 | M | I-02 | SRE |
| I-04 | Integrar observabilidade (erro client + web vitals + uptime) | P1 | M | I-03 | SRE |
| I-05 | Definir arquitetura de autenticação e sessão | P1 | G | I-03 | Arquiteto Principal |
| I-06 | Implantar trilha LGPD (consentimento, retenção, exclusão) | P1 | M | I-05 | Security/Legal |
| I-07 | Modelar domínio de planos, trial e limites de uso | P1 | M | I-05 | Product + Backend |
| I-08 | Implementar camada de billing (provedor + webhooks idempotentes) | P1 | G | I-07 | Backend Lead |
| I-09 | Otimização de performance (lazy loading, budgets, cache) | P2 | M | I-04 | Frontend Lead |
| I-10 | FinOps: tagging de custos e orçamento com alertas | P2 | P | I-03 | SRE/Finance |

---

## 5. Dívida Técnica

1. Acoplamento de infraestrutura via URL hardcoded de API.
2. Ausência de tipagem estática para contratos de dados.
3. Sem camada de domínio para regras de carrinho/plano (regras misturadas no UI state).
4. Sem suíte de testes automatizados para fluxos críticos.
5. Ausência de estratégia de gestão de estado escalável para evolução SaaS multi-feature.
6. Falta de versionamento de schema persistido no `localStorage`.

### Risco legal
- Não há evidência de políticas de privacidade, retenção, consentimento explícito, auditoria de acesso ou DSR (data subject request).

### Risco financeiro
- Sem telemetria de conversão/retenção → risco de investimento ineficiente em aquisição.
- Sem FinOps e alerta de custos → risco de crescimento com margem negativa.

---

## 6. Roadmap

### Método de priorização (WSJF)
Fórmula: **WSJF = (Valor de Negócio + Criticidade Temporal + Redução de Risco/Oportunidade) / Tamanho do Job**.

| ID | Iniciativa | BV | TC | RR/OE | Job Size | WSJF |
|---|---|---:|---:|---:|---:|---:|
| RDM-01 | Resiliência de API + fallback | 10 | 10 | 10 | 4 | **7.5** |
| RDM-02 | CI/CD + qualidade automatizada | 9 | 8 | 9 | 5 | **5.2** |
| RDM-03 | Observabilidade ponta a ponta | 8 | 8 | 9 | 5 | **5.0** |
| RDM-04 | IAM (AuthN/AuthZ) | 9 | 7 | 8 | 8 | **3.0** |
| RDM-05 | Billing + webhooks + reconciliação | 10 | 7 | 8 | 13 | **1.9** |
| RDM-06 | Growth analytics + experimentação | 8 | 6 | 7 | 8 | **2.6** |
| RDM-07 | LGPD: retenção, consentimento e DSR | 8 | 7 | 9 | 7 | **3.5** |

### Horizonte 0–3 meses (Estabilidade + Segurança)

| ID | Descrição | Justificativa estratégica | Esforço | Owner | Dependências | Critério de aceitação | KPI |
|---|---|---|---|---|---|---|---|
| H1-01 | Resiliência da API (env var, timeout, retry, fallback) | Elimina SPOF operacional imediato | M | Tech Lead FE | - | Queda da API não derruba catálogo por > 5 min | Disponibilidade catálogo > 99.5% |
| H1-02 | CI/CD com quality gates | Reduz regressão e risco de deploy | M | SRE | H1-01 | Pipeline bloqueia merge sem build+test+lints | Change failure rate < 15% |
| H1-03 | Observabilidade base | Detecta incidentes em tempo real | M | SRE | H1-02 | Alertas + dashboard web vitals e erro client ativos | MTTD < 10 min |
| H1-04 | Baseline de segurança (headers, SAST, dependabot) | Reduz superfície de ataque | P | Security Lead | H1-02 | Vulnerabilidades críticas = 0 em main | CVEs críticas abertas = 0 |
| H1-05 | Testes E2E de checkout/carrinho | Protege receita e UX core | M | QA/FE | H1-02 | 3 fluxos críticos automatizados | Cobertura fluxo crítico > 80% |

### Horizonte 3–9 meses (Escalabilidade + Produto)

| ID | Descrição | Justificativa estratégica | Esforço | Owner | Dependências | Critério de aceitação | KPI |
|---|---|---|---|---|---|---|---|
| H2-01 | Implementar IAM (login, sessão, roles) | Base para planos e limites | G | Arquiteto + Backend | H1-04 | Autenticação OIDC + RBAC operacional | Taxa de login sucesso > 98% |
| H2-02 | Billing (assinatura, trial, upgrade/downgrade) | Habilita monetização recorrente | G | Backend Lead | H2-01 | Ciclo completo de cobrança com webhooks idempotentes | MRR > meta mensal |
| H2-03 | Limites de uso por plano | Evita abuso e suporta upsell | M | Product + Backend | H2-02 | Enforcement server-side em 100% dos endpoints pagos | Conversão free→paid |
| H2-04 | Data governance LGPD | Mitiga risco regulatório | M | Security/Legal | H2-01 | Fluxos de consentimento, retenção e exclusão auditáveis | % DSR dentro do SLA |
| H2-05 | Performance program (cache/CDN/code split) | Melhora conversão e CAC payback | M | Frontend Lead | H1-03 | LCP p75 < 2.5s em mobile | Conversão +15% |

### Horizonte 9–24 meses (Crescimento + Monetização + Diferenciação)

| ID | Descrição | Justificativa estratégica | Esforço | Owner | Dependências | Critério de aceitação | KPI |
|---|---|---|---|---|---|---|---|
| H3-01 | Motor de recomendações e personalização | Diferenciação e aumento de ticket | G | Data/Product | H2-03 | Recomendações em produção com A/B test | AOV +12% |
| H3-02 | Multi-tenant SaaS readiness | Escala B2B e expansão | G | Arquiteto Principal | H2-01 | Isolamento lógico por tenant auditado | NRR > 110% |
| H3-03 | Revenue intelligence (coortes/churn) | Otimiza pricing e retenção | M | Finance + Product | H2-02 | Painéis de coorte com ações mensais | Churn logo < 3.5% |
| H3-04 | Marketplace de integrações (webhooks/API pública) | Efeito de rede e lock-in positivo | G | Platform Lead | H2-02 | SDK + docs + 3 integrações oficiais | % receita por parceiros |

### Roadmap estilo Gantt textual

```text
M0 M1 M2 M3 | M4 M5 M6 M7 M8 M9 | M10 ... M24
[H1-01====]
[H1-02  ====]
[H1-03    ====]
[H1-04   ===]
[H1-05    ====]
             [H2-01======]
               [H2-02========]
                 [H2-03====]
                [H2-04====]
                 [H2-05====]
                                   [H3-01========]
                                   [H3-02==========]
                                     [H3-03======]
                                       [H3-04==========]
```

---

## 7. Plano de Negócio

### Missão
Entregar uma plataforma SaaS de pedidos digitais para restaurantes independentes, com operação simples, alta disponibilidade e crescimento previsível de receita recorrente.

### ICP
- Restaurantes e hamburguerias com 1–10 unidades.
- Faturamento mensal entre R$ 80 mil e R$ 1,5 milhão.
- Operação com alta dependência de delivery e canais digitais.

### TAM / SAM / SOM (hipóteses iniciais Brasil)
- **TAM:** 400 mil estabelecimentos potencialmente digitalizáveis.
- **SAM:** 80 mil estabelecimentos alvo no nicho de food service urbano.
- **SOM (36 meses):** 1.600 contas pagas (2% de SAM).

### Modelo de receita
1. Assinatura mensal por plano (Starter/Growth/Scale).
2. Add-ons (integrações, analytics avançado).
3. Taxa opcional por processamento de pagamentos (quando habilitado).

### Estratégia de preço (exemplo)
- Starter: R$ 199/mês
- Growth: R$ 499/mês
- Scale: R$ 1.199/mês
- Add-ons: R$ 99–399/mês

### Go-to-market
1. Canal direto inside sales para ICP inicial.
2. Parcerias com agências e consultorias de food service.
3. Conteúdo de performance operacional + estudos de caso.
4. Trial de 14 dias com onboarding assistido.

### Projeções (12 e 36 meses)

#### 12 meses
- Contas pagas: 180 (cenário provável)
- ARPA médio: R$ 420
- **MRR:** ~R$ 75.600
- Churn mensal alvo: < 4.5%

#### 36 meses
- Contas pagas: 1.600 (cenário provável)
- ARPA médio: R$ 560
- **MRR:** ~R$ 896.000
- Margem bruta alvo: > 75%

### Cenários

| Cenário | 12m MRR | 36m MRR | Premissas |
|---|---:|---:|---|
| Conservador | R$ 42k | R$ 420k | CAC alto, onboarding lento, churn 6% |
| Provável | R$ 75.6k | R$ 896k | Execução roadmap em dia, churn 3.8% |
| Agressivo | R$ 125k | R$ 1.45M | Forte canal de parceiros e upsell avançado |

### Riscos e mitigação (ligados ao roadmap)
- Risco de indisponibilidade (mitigado por H1-01/H1-03).
- Risco de não monetizar (mitigado por H2-02/H2-03).
- Risco regulatório (mitigado por H2-04).
- Risco de churn por baixa performance (mitigado por H2-05/H3-03).

---

## 8. Regras de Negócio

| ID | Nome | Condição | Ação | Responsável | Teste Automatizado | Severidade |
|---|---|---|---|---|---|---|
| BR-01 | Login obrigatório para área paga | Usuário tenta acessar rota premium sem sessão válida | Redirecionar para login e registrar tentativa | Backend/Auth | E2E rota protegida | Alta |
| BR-02 | Sessão expirada | JWT vencido ou inválido | Revogar sessão local e solicitar novo login | Backend/Auth | Unit + integração token | Alta |
| BR-03 | Trial de 14 dias | Conta criada no plano trial | Liberar recursos trial até `trial_end_at` | Product/Billing | Teste de data limite | Média |
| BR-04 | Upgrade imediato | Cliente muda para plano superior | Aplicar novos limites instantaneamente + pró-rata | Billing | Integração billing | Alta |
| BR-05 | Downgrade no ciclo seguinte | Cliente muda para plano inferior | Agendar alteração para próxima renovação | Billing | Teste de ciclo | Alta |
| BR-06 | Falha de pagamento | Provedor retorna cobrança recusada | Aplicar dunning e suspensão gradual | Billing/Finance | Simulação webhook falha | Alta |
| BR-07 | Limite de uso por plano | Consumo excede cota mensal | Bloquear nova operação e sugerir upgrade | Backend/Product | Integração quota | Alta |
| BR-08 | Retenção de dados | Conta cancelada há > 90 dias | Anonimizar/excluir dados pessoais conforme política | Security/Legal | Job agendado + auditoria | Alta |
| BR-09 | Privacidade e consentimento | Primeiro acesso com cookies não essenciais | Exibir banner, coletar consentimento granular | Frontend/Security | E2E consentimento | Média |
| BR-10 | Incidente P1 | Erro crítico em produção detectado | Abrir incidente, acionar on-call, publicar status page | SRE | Simulação game day | Alta |
| BR-11 | Webhooks idempotentes | Evento duplicado do provedor | Ignorar duplicata por `event_id` | Backend | Teste de idempotência | Alta |
| BR-12 | SLA de suporte | Cliente enterprise abre chamado crítico | Responder em até 1h e atualizar a cada 2h | Suporte/SRE | Auditoria SLA mensal | Média |

---

## 9. Backlog Fora do Fluxo

| ID | Descrição | Urgente? | Status | Destino |
|---|---|---|---|---|
| OF-01 | Resiliência de API e fallback | Sim | Aberto | Hotfix ≤ 7 dias |
| OF-02 | Pipeline CI/CD com gates | Sim | Aberto | Hotfix ≤ 7 dias |
| OF-03 | Observabilidade com alertas | Sim | Aberto | Hotfix ≤ 7 dias |
| OF-04 | FinOps tagging e orçamento | Não | Planejado | Backlog Roadmap H2 |
| OF-05 | Recomendação por ML | Não | Ideia | Backlog Roadmap H3 |

---

## 10. Registro de Decisões

| ADR | Decisão | Contexto | Alternativas avaliadas | Consequência |
|---|---|---|---|---|
| ADR-001 | Priorizar resiliência antes de novas features | SPOF atual bloqueia operação | Construir features sem hardening | Menor risco operacional imediato |
| ADR-002 | Adotar WSJF para priorização executiva | Recursos limitados e alta incerteza | Priorização por opinião/urgência ad-hoc | Maior rastreabilidade de investimento |
| ADR-003 | IAM e billing somente após CI/CD e observabilidade | Evitar escalar sem controles | Implementar billing imediatamente | Reduz risco de falhas financeiras/regulatórias |
| ADR-004 | Política de tarefas fora do fluxo | Preservar foco de sprint | Interromper sprint para todo incidente | Previsibilidade de entrega com resposta a urgências |
