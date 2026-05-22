from pathlib import Path
import json

from jsonschema import Draft202012Validator
from referencing import Registry, Resource

ROOT = Path(__file__).resolve().parents[1]
CORE = ROOT / "schema" / "v0.1" / "core.schema.json"
PROFILES = ROOT / "schema" / "v0.1" / "profiles"
EXAMPLES = ROOT / "examples" / "v0.1"


def load_json(path: Path):
    return json.loads(path.read_text())


def build_registry():
    resources = []
    core = load_json(CORE)
    resources.append((core["$id"], Resource.from_contents(core)))
    # Local relative refs used by profiles.
    resources.append(("https://ticketschema.org/schema/v0.1/core.schema.json", Resource.from_contents(core)))
    for path in PROFILES.glob("*.schema.json"):
        schema = load_json(path)
        resources.append((schema["$id"], Resource.from_contents(schema)))
        # File-name based URI variant, e.g. schema file payment-receipt.schema.json
        # has canonical $id ending payment-receipt.json.
        file_uri = f"https://ticketschema.org/schema/v0.1/profiles/{path.name.replace('.schema.json', '.json')}"
        resources.append((file_uri, Resource.from_contents(schema)))
    return Registry().with_resources(resources)


def test_examples_validate():
    registry = build_registry()
    for example_path in EXAMPLES.glob("*.json"):
        data = load_json(example_path)
        schema_uri = data["$schema"]
        resource = registry.get(schema_uri)
        assert resource is not None, f"schema not registered: {schema_uri}"
        schema = resource.contents
        validator = Draft202012Validator(schema, registry=registry)
        errors = sorted(validator.iter_errors(data), key=lambda e: e.path)
        assert not errors, f"{example_path.name}: {[e.message for e in errors]}"
