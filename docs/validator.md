# Validator

Run locally:

```bash
python3 tools/ticket_schema_validator.py validate examples/v0.1/retail-receipt-mx.json
```

Quiet mode:

```bash
python3 tools/ticket_schema_validator.py validate --quiet document.json
```

Exit codes:

- `0`: valid
- `1`: invalid
- `2`: CLI usage error
