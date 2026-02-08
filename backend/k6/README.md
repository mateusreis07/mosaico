# Load Testing Guide (RPS Based)

Este teste simula um cenário real de dia de jogo focado em **Requisições por Segundo (RPS)**, em vez de apenas usuários simultâneos.

## Cenário Configurado

O teste utiliza o executor `ramping-arrival-rate` para garantir que a carga chegue ao servidor independentemente da velocidade de resposta (Open Model).

| Fase | RPS Alvo | Duração | Descrição |
|------|----------|---------|-----------|
| **Warm-up** | 300 | 30s | Aquece o cache e conexões |
| **Peak** | 2.500 | 2m | Simulação de intervalo de jogo |
| **Stress** | 5.000 | 1m | Pico extremo (Gol/Celebração) |
| **Cooldown** | 0 | 30s | Encerramento gradual |

**Distribuição:**
- 80% Cache Hits (Assentos A-1-1 a A-1-100)
- 20% Cache Misses (Novos assentos)

## Como Rodar

```bash
k6 run k6/load-test.js
```

## Interpretando os Resultados

### Métricas de Sucesso
1. **http_req_duration > p(95) < 200ms**:
   - Como 80% das chamadas são cacheadas (0-5ms), a média e o p95 devem ser baixos.
   - Se subir > 500ms, o cache não está sendo efetivo ou o Node.js está bloqueado.

2. **http_req_failed < 1%**:
   - Erros de conexão ou timeouts indicam que o servidor não aguentou o RPS alvo.

3. **dropped_iterations**:
   - Se este número for > 0, significa que sua **máquina local** (onde roda o k6) não conseguiu gerar carga suficiente. O gargalo é o teste, não a API.

## Dicas de Performance Local

- Este teste gera até 5.000 requisições/segundo. Isso requer bastante CPU e portas de rede.
- Se vir erros como `socket: too many open files`, aumente o limite do SO ou reduza o RPS no script.
