# Stack Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Mobile framework | Expo SDK 53+ | Zero-config QR scanner + camera, APK build via EAS |
| Web framework | Vite + React + TypeScript | Fast DX, Tailwind v4 support |
| CSS | Tailwind CSS v4 | No PostCSS config, Vite plugin |
| Package manager | pnpm | Monorepo workspaces, efficient disk usage |
| Backend | Supabase | Auth, RLS, storage, edge functions, realtime |
| Auth (boss) | Supabase Auth (email/password) | JWT-based, triggers profile creation |
| Auth (worker) | PIN code via verify_pin() RPC | Simple, 5-attempt lockout |
| APK build | EAS Build | Cloud-based, no local Android SDK needed |
