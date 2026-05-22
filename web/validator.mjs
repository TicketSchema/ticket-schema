import { Validator } from '@cfworker/json-schema';
import { schemas } from './schemaRegistry.mjs';

const validators = new Map();

function getValidator(schemaUri) {
  if (validators.has(schemaUri)) return validators.get(schemaUri);
  const schema = schemas[schemaUri];
  if (!schema) return null;

  const validator = new Validator(schema, '2020-12', false);
  for (const [uri, extraSchema] of Object.entries(schemas)) {
    if (uri !== schemaUri) validator.addSchema(extraSchema);
  }
  validators.set(schemaUri, validator);
  return validator;
}

function normalizeErrors(errors = []) {
  return errors.map((error) => ({
    path: (error.instanceLocation || '#').replace(/^#/, '') || '/',
    keyword: error.keyword || 'invalid',
    message: error.error || 'invalid',
    params: {},
  }));
}

export function validateTicketDocument(document) {
  if (!document || typeof document !== 'object' || Array.isArray(document)) {
    return {
      valid: false,
      schema: null,
      errors: [{ path: '/', keyword: 'type', message: 'document must be a JSON object', params: {} }],
    };
  }

  const schemaUri = document.$schema;
  if (!schemaUri || typeof schemaUri !== 'string') {
    return {
      valid: false,
      schema: null,
      errors: [{ path: '/$schema', keyword: 'required', message: 'missing $schema', params: {} }],
    };
  }

  const validator = getValidator(schemaUri);
  if (!validator) {
    return {
      valid: false,
      schema: schemaUri,
      errors: [{ path: '/$schema', keyword: 'unknownSchema', message: `unknown schema: ${schemaUri}`, params: {} }],
    };
  }

  const result = validator.validate(document);
  return {
    valid: result.valid,
    schema: schemaUri,
    errors: result.valid ? [] : normalizeErrors(result.errors),
  };
}
