#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any

from jsonschema import Draft202012Validator
from referencing import Registry, Resource

ROOT = Path(__file__).resolve().parents[1]
CORE = ROOT / "schema" / "v0.1" / "core.schema.json"
PROFILES = ROOT / "schema" / "v0.1" / "profiles"


def load_json(path: Path) -> Any:
    return json.loads(path.read_text())


def build_registry() -> Registry:
    resources = []
    core = load_json(CORE)
    resources.append((core["$id"], Resource.from_contents(core)))
    resources.append(("https://ticketschema.org/schema/v0.1/core.schema.json", Resource.from_contents(core)))
    for path in PROFILES.glob("*.schema.json"):
        schema = load_json(path)
        resources.append((schema["$id"], Resource.from_contents(schema)))
        file_uri = f"https://ticketschema.org/schema/v0.1/profiles/{path.name.replace('.schema.json', '.json')}"
        resources.append((file_uri, Resource.from_contents(schema)))
    return Registry().with_resources(resources)


def validate_file(path: Path, *, quiet: bool = False) -> int:
    try:
        data = load_json(path)
    except Exception as exc:
        if not quiet:
            print(f"invalid: cannot read JSON: {exc}")
        return 1

    schema_uri = data.get("$schema")
    if not schema_uri:
        if not quiet:
            print("invalid: missing $schema")
        return 1

    registry = build_registry()
    resource = registry.get(schema_uri)
    if resource is None:
        if not quiet:
            print(f"invalid: unknown schema {schema_uri}")
        return 1

    validator = Draft202012Validator(resource.contents, registry=registry)
    errors = sorted(validator.iter_errors(data), key=lambda e: list(e.path))
    if errors:
        if not quiet:
            print(f"invalid: {path}")
            for error in errors:
                location = ".".join(str(part) for part in error.path) or "<root>"
                print(f"- {location}: {error.message}")
        return 1

    if not quiet:
        print(f"valid: {path}")
    return 0


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="ticket-schema")
    sub = parser.add_subparsers(dest="command", required=True)

    validate = sub.add_parser("validate", help="Validate a Ticket Schema JSON document")
    validate.add_argument("file", type=Path)
    validate.add_argument("--quiet", "-q", action="store_true")

    args = parser.parse_args(argv)
    if args.command == "validate":
        return validate_file(args.file, quiet=args.quiet)
    return 2


if __name__ == "__main__":
    raise SystemExit(main())
