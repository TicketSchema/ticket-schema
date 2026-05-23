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

### Validate

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

### Render as JSON

```http
POST /api/render
content-type: application/json
```

Request:

```json
{
  "document": {
    "$schema": "https://ticketschema.org/schema/v0.1/profiles/retail-receipt.json"
  }
}
```

Response:

```json
{
  "valid": true,
  "schema": "https://ticketschema.org/schema/v0.1/profiles/retail-receipt.json",
  "errors": [],
  "html": "<div class=\"ticket-schema-render\">...</div>"
}
```

### Render as direct HTML

```http
POST /api/render/html
content-type: application/json
```

Request body is the same as `/api/render`. Response content type is `text/html; charset=utf-8`.

## Local dev

```bash
npm install
npm run build:schemas
npx wrangler pages dev public
```
