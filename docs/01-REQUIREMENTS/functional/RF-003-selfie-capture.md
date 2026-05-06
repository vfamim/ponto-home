# RF-003: Selfie Capture

## Requirement
Workers must take a selfie as proof of presence during clock-in/out.

## Acceptance Criteria
- Camera switches to front-facing after QR validation
- Capture button displayed at bottom center
- White screen flash + haptic on capture
- Photo uploaded to Supabase storage (time-photos bucket)
- Path pattern: `{worker_id}/{log_type}_{timestamp}.jpg`

## Priority
Must-have
