export class Validators {
  static isEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  static isNotEmpty(value: unknown): boolean {
    if (typeof value === 'string') {
      return value.trim().length > 0;
    }
    return value !== null && value !== undefined;
  }

  static isNumeric(value: unknown): boolean {
    return typeof value === 'number' || !isNaN(Number(value));
  }

  static validateObject(
    obj: Record<string, unknown>,
    schema: Record<string, string>
  ): { valid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};

    for (const [key, type] of Object.entries(schema)) {
      const value = obj[key];

      if (!value && type !== 'optional') {
        errors[key] = `${key} is required`;
        continue;
      }

      if (value && typeof value !== type.replace('?', '')) {
        errors[key] = `${key} must be of type ${type}`;
      }
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors,
    };
  }
}
