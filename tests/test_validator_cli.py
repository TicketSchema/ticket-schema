import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CLI = ROOT / "tools" / "ticket_schema_validator.py"
VALID_EXAMPLE = ROOT / "examples" / "v0.1" / "retail-receipt-mx.json"


def run_cli(*args):
    return subprocess.run(
        [sys.executable, str(CLI), *args],
        cwd=ROOT,
        text=True,
        capture_output=True,
    )


def test_validator_accepts_valid_example():
    result = run_cli("validate", str(VALID_EXAMPLE))
    assert result.returncode == 0
    assert "valid" in result.stdout.lower()


def test_validator_rejects_invalid_document(tmp_path):
    data = json.loads(VALID_EXAMPLE.read_text())
    data.pop("ticketSchemaVersion")
    invalid = tmp_path / "invalid.json"
    invalid.write_text(json.dumps(data))

    result = run_cli("validate", str(invalid))

    assert result.returncode == 1
    assert "invalid" in result.stdout.lower()
    assert "ticketSchemaVersion" in result.stdout


def test_validator_supports_quiet_mode():
    result = run_cli("validate", "--quiet", str(VALID_EXAMPLE))
    assert result.returncode == 0
    assert result.stdout == ""
