# RF-008: Auth Flow

## Requirement
System must support two authentication flows: boss (email/password) and worker (PIN code).

## Acceptance Criteria
- Boss: Supabase Auth email/password, JWT stored in browser
- Worker: PIN code via verify_pin() RPC
- PIN: 4-digit code, 5 attempts then 15-min lockout
- Auto-cleanup of PIN rate limit counters via pg_cron

## Priority
Must-have
