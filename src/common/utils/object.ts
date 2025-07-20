function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

export function camelCaseToSnakeCase(obj: unknown): unknown {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => camelCaseToSnakeCase(item));
  }

  if (typeof obj === 'object' && obj.constructor === Object) {
    const snakeCaseObj: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
      const snakeKey = camelToSnake(key);
      snakeCaseObj[snakeKey] = camelCaseToSnakeCase(value);
    }

    return snakeCaseObj;
  }

  return obj;
}
