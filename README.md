# Ponto Home

Projeto pessoal para registro de ponto via QR code. Cada pessoa tem um QR/token único; o leitor web (PWA) usa a câmera para registrar a batida com hora do servidor.

## Estrutura
- `docker-compose.yml` — Postgres, API (Express/Prisma), Web (Vite/React).
- `backend/` — API Node/TypeScript com endpoints de check-in e gestão de pessoas.
- `frontend/` — PWA simples para leitura de QR e fallback manual.
- `.env.example` — variáveis necessárias para API e Web.

## Primeiros passos (dev)
1) Copie `.env.example` para `.env` ajustando `DATABASE_URL`, `JWT_SECRET` e `VITE_API_URL`.
2) `docker-compose up -d db` para subir o Postgres.
3) Backend:
   - `cd backend && npm install`
   - `npx prisma migrate dev --name init`
   - `npm run dev` (porta 4000)
4) Frontend:
   - `cd frontend && npm install`
   - `npm run dev -- --host` (porta 5173)
5) Acesse `http://localhost:5173` e aponte a câmera para um QR contendo o token.

### Rotas principais (API)
- `POST /api/checkins` `{ token, type?, location? }` — registra batida com hora do servidor.
- `GET /api/people` — lista pessoas.
- `POST /api/people` `{ name, department? }` — cria pessoa e token de QR.
- `POST /api/people/:id/rotate-token` — gera novo token.
- `GET /health` — healthcheck rápido.

### Próximos passos sugeridos
- Implementar autenticação para admins e operators.
- Painel web para CRUD de pessoas, geração de QR e export de batidas.
- Export CSV/relatórios e filtros de data/status.
- Hardening: HTTPS local (mkcert), rate limiting, CORS restrito, testes e observabilidade.
