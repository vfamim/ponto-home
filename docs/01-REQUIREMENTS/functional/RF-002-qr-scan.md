# RF-002: QR Code Scan

## Requirement
Workers must scan a static QR Code in the kitchen to validate their clock-in/out.

## Acceptance Criteria
- Camera activates with back-facing QR scanner
- Scanned value is validated against QR_CODE_VALUE constant
- Invalid QR shows error with haptic feedback
- Valid QR proceeds to selfie capture
- Flashlight toggle available during scanning

## Priority
Must-have
