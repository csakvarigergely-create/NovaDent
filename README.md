# NovaDent Landing

## Environment variable beállítás (Vercel)

Az időpontkérő űrlap backendje a `/api/lead` endpointon keresztül küldi az adatokat Make webhookra.  
Vercelben kötelező beállítani:

`MAKE_WEBHOOK_URL=https://hook.eu1.make.com/...`

Fontos: a webhook URL-t nem szabad a frontend kódba hardcode-olni.  
A webhook címet kizárólag szerveroldalon, környezeti változóból kell olvasni.
