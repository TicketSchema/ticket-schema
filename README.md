# PaperSpec

PaperSpec is an open JSON Schema standard for digital documents that replace physical paper: receipts, payment notes, delivery notes, warranties, loan notes, service records, reservations, and related transaction records.

## Status

Draft `v0.1`.

## Core idea

A PaperSpec document is:

- portable;
- machine-readable;
- profile-based;
- event-aware;
- non-fiscal by default;
- extensible for local legal/fiscal requirements.

## Minimal document

```json
{
  "$schema": "https://paperspec.org/schema/v0.1/core.json",
  "paperSpecVersion": "0.1",
  "id": "ps_01HX0000000000000000000000",
  "documentType": "payment_receipt",
  "status": "issued",
  "issuedAt": "2026-05-22T10:00:00-06:00",
  "parties": [],
  "events": []
}
```

## Compatibility language

Apps should say:

- `PaperSpec-compatible`
- `Validated by PaperSpec Schema`

## Repository layout

```text
schema/v0.1/core.schema.json
schema/v0.1/profiles/*.schema.json
examples/v0.1/*.json
docs/*.md
tests/validate_examples.py
```

## License

MIT for code. CC-BY-4.0 for specification text.
