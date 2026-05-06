# RF-005: Offline Sync

## Requirement
Workers must be able to clock in/out when network is unavailable.

## Acceptance Criteria
- Yellow persistent banner when offline
- Records saved locally with synced=FALSE
- Photos saved to local filesystem
- Automatic sync when network restores (NetInfo monitoring)
- Manual sync option in Settings
- Offline records uploaded with log_source='offline_sync'

## Priority
Must-have
