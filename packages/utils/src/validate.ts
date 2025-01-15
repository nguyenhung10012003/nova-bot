import Ajv from 'ajv';

export function validateData(data: unknown, schema: object | boolean): boolean {
  const ajv = new Ajv();
  const validate = ajv.compile(schema);
  const isValid = validate(data);

  if (!isValid) {
    return false;
  }

  return true;
}
