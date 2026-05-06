# RNF-002: Security (RLS)

## Requirement
All data access must be scoped per boss via Row Level Security.

## Acceptance Criteria
- Boss can only see own workers and their time logs
- Workers can only see own profile and time logs
- Storage buckets enforce folder-level RLS
- Service role has full access for Edge Functions
- PIN verification uses SECURITY DEFINER

## Priority
Must-have
