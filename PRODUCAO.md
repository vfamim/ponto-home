# 🚀 Ponto Home - Guia de Produção

## ✅ Status Atual

| Componente | Status | Observações |
|------------|--------|-------------|
| **Monorepo pnpm** | ✅ Pronto | Workspaces configurados |
| **@ponto/shared** | ✅ Pronto | Types + constants (9 testes) |
| **@ponto/mobile** | ✅ Pronto | Expo SDK 53, 25 testes |
| **@ponto/web** | ✅ Pronto | Vite + React, 6 testes |
| **Supabase DB** | ✅ Pronto | Tabelas, funções, RLS |
| **TypeScript** | ✅ Passando | 0 erros em todos packages |
| **Testes** | ✅ 40/40 | Todos passando |

---

## ⚠️ O que falta para Produção

### 1. Arquivos `.env` (JÁ CRIADOS)

Os arquivos `.env` já foram criados automaticamente com as chaves do Supabase:
- ✅ `apps/web/.env`
- ✅ `apps/mobile/.env`

**Projeto Supabase:** `https://cylsqbmtglvdfubbarqe.supabase.co`

---

### 2. Storage Bucket (NÃO CRIADO)

**Ação necessária:** Criar bucket `time-photos` no Supabase

```bash
# Via Supabase Dashboard:
# 1. Acesse: https://cylsqbmtglvdfubbarqe.supabase.co
# 2. Storage → New bucket
# 3. Nome: time-photos
# 4. Public: false (privado)
# 5. Salvar
```

**Política RLS necessária:**
```sql
-- No SQL Editor do Supabase:
CREATE POLICY "Workers can upload photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'time-photos');

CREATE POLICY "Boss can view all photos"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'time-photos');
```

---

### 3. Edge Function Deploy (NÃO DEPLOYADA)

**Ação necessária:** Deploy da função `create-worker`

```bash
# Instale Supabase CLI se não tiver:
npm install -g supabase

# Login:
supabase login

# Link ao projeto:
supabase link --project-ref cylsqbmtglvdfubbarqe

# Deploy:
supabase functions deploy create-worker
```

**Alternativa via Dashboard:**
1. Acesse: https://cylsqbmtglvdfubbarqe.supabase.co
2. Edge Functions → Create new function
3. Upload do arquivo: `supabase/functions/create-worker/index.ts`

---

### 4. Usuário "Boss" (NÃO CRIADO)

**Ação necessária:** Criar primeiro usuário admin no Supabase Auth

```bash
# Via Supabase Dashboard:
# 1. Authentication → Users
# 2. Add user
# 3. Email: admin@ponto.home
# 4. Senha: (sua senha segura)
# 5. Email Confirm: marcar
# 6. User metadata:
#    {
#      "full_name": "Administrador",
#      "role": "boss"
#    }
```

**Via SQL (opcional):**
```sql
-- No SQL Editor:
INSERT INTO auth.users (email, email_confirmed_at, raw_user_meta_data)
VALUES ('admin@ponto.home', now(), '{"full_name": "Administrador", "role": "boss"}'::jsonb);
```

---

## 🧪 Testar em Produção

### Web Dashboard

```bash
# Desenvolvimento:
pnpm dev:web
# Acessa: http://localhost:5173

# Build produção:
pnpm build:web
pnpm preview
```

**Fluxo de teste:**
1. Login: `admin@ponto.home` / senha
2. Workers → Criar trabalhador
3. Preencher: Nome, PIN (4 dígitos), telefone
4. Dashboard → Ver registros em tempo real

---

### Mobile (Expo)

```bash
# Desenvolvimento (expo-go):
pnpm dev:mobile
# Scan QR code com app Expo Go

# Build APK (produção):
cd apps/mobile
eas build --platform android --profile production
```

**Fluxo de teste:**
1. Digitar PIN (4 dígitos)
2. Selecionar: ENTRADA / SAÍDA / ALMOCO
3. Scannear QR Code: `PONTO_KITCHEN_2026`
4. Selfie → Upload
5. Web Dashboard → Ver registro

---

## 📊 Métricas Atuais

```
Database:
  - Users: 0
  - Profiles: 0
  - Time Logs: 0
  - App Config: 2 (rate limiting)

Functions:
  - verify_pin: ✅ Criada
  - handle_new_user: ✅ Criada
  - create-worker: ⚠️ Pendente deploy

Storage:
  - time-photos: ⚠️ Não criado

Tests:
  - @ponto/shared: 9 passed
  - @ponto/mobile: 25 passed
  - @ponto/web: 6 passed
  - Total: 40/40 ✅
```

---

## 🔧 Deploy Web (Vercel)

```bash
# Instalar Vercel CLI:
npm i -g vercel

# Deploy:
cd apps/web
vercel --prod
```

**Configurações Vercel:**
- Build Command: `pnpm build`
- Output Directory: `dist`
- Install Command: `pnpm install`

**Variáveis de ambiente (Vercel):**
- `VITE_SUPABASE_URL`: `https://cylsqbmtglvdfubbarqe.supabase.co`
- `VITE_SUPABASE_ANON_KEY`: (sua chave)

---

## 📱 Deploy Mobile (EAS)

```bash
# Instalar EAS CLI:
npm i -g eas-cli

# Configurar:
cd apps/mobile
eas build:configure

# Build APK:
eas build --platform android --profile production

# Build OTA update (futuro):
eas update
```

---

## 🎯 Próximos Passos (Resumo)

1. ✅ **Já feito:** Código, types, testes, .env
2. ⚠️ **Falta:** Storage bucket `time-photos`
3. ⚠️ **Falta:** Deploy Edge Function `create-worker`
4. ⚠️ **Falta:** Criar usuário boss no Auth
5. ⚠️ **Falta:** Testar fluxo completo

---

## 🆘 Comandos Úteis

```bash
# Desenvolvimento:
pnpm dev:web          # Web: http://localhost:5173
pnpm dev:mobile       # Mobile: Expo DevTools

# Testes:
pnpm test             # Todos testes
pnpm --filter @ponto/web test    # Web testes
pnpm --filter @ponto/mobile test # Mobile testes

# Typecheck:
pnpm typecheck        # Todo o projeto

# Build:
pnpm build:web        # Build web production
```

---

## 📞 Suporte

- **Docs:** `/docs/` (pasta docs no projeto)
- **Supabase:** https://cylsqbmtglvdfubbarqe.supabase.co
- **Logs:** Supabase Dashboard → Logs

---

**Última atualização:** 2026-05-05
**Versão:** 0.1.0 (pré-lançamento)
