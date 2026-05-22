# Web validator

Target host:

```text
https://ticketschema.org
```

Current deployment target:

```text
Cloudflare Pages
```

## REST API

```http
POST /api/validate
content-type: application/json
```

Response when valid:

```json
{
  "valid": true,
  "schema": "https://ticketschema.org/schema/v0.1/profiles/retail-receipt.json",
  "errors": []
}
```

Response when invalid:

```json
{
  "valid": false,
  "schema": "https://ticketschema.org/schema/v0.1/profiles/retail-receipt.json",
  "errors": []
}
```

## Local dev

```bash
npm install
npm run build:schemas
npx wrangler pages dev public
```
