# SOP: Contingencies

## Network Failure
1. App detects offline via NetInfo
2. Yellow banner: "Sem conexao. Registro salvo no aparelho."
3. Time log saved locally with synced=FALSE
4. Background sync monitors connectivity
5. When network restores, pending records uploaded
6. Manual fallback: Settings > "Sincronizar Agora"
7. If sync fails after 24h: supervisor exports CSV via share

## Power Outage (QR in Dark)
1. Worker enables flashlight (in-app torch button)
2. If insufficient: supervisor provides battery-powered lantern
3. If QR unreadable: supervisor enters "Registro Manual" mode
4. Manual record flagged with log_source='manual'

## Camera Malfunction
1. App checks camera permission
2. If granted but fails: "Camera indisponivel" + retry
3. After 3 retries: "Registro Sem Foto" mode
4. Time log saved with photo_path=NULL, photo_skipped_reason='camera_malfunction'
5. Flagged for supervisor review
