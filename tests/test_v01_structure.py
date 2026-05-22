from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[1]
PROFILES = ROOT / "schema" / "v0.1" / "profiles"
EXAMPLES = ROOT / "examples" / "v0.1"

REQUIRED_PROFILES = {
    "retail-receipt.schema.json",
    "payment-receipt.schema.json",
    "payment-request.schema.json",
    "delivery-note.schema.json",
    "loan-note.schema.json",
    "service-record.schema.json",
}

REQUIRED_EXAMPLES = {
    "retail-receipt-mx.json",
    "payment-receipt.json",
    "payment-request-mx.json",
    "delivery-note-mx.json",
    "loan-note.json",
    "service-record-mx.json",
}


def test_v01_has_required_profiles():
    assert REQUIRED_PROFILES <= {p.name for p in PROFILES.glob("*.schema.json")}


def test_v01_has_required_examples():
    assert REQUIRED_EXAMPLES <= {p.name for p in EXAMPLES.glob("*.json")}


def test_examples_use_ticket_schema_uri_and_id_prefix():
    for path in EXAMPLES.glob("*.json"):
        data = json.loads(path.read_text())
        assert data["$schema"].startswith("https://ticketschema.org/schema/v0.1/")
        assert data["ticketSchemaVersion"] == "0.1"
        assert data["id"].startswith("ts_")
