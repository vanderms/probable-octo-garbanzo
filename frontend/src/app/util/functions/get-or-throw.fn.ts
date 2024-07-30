export const getOrThrow = <T>(value: T | null | undefined, message = ''): T => {
  if (value !== null && value !== undefined) return value;
  throw Error(message);
};

export const getOrElse = <T>(value: T | null | undefined, _default: T): T => {
  if (value !== null && value !== undefined) return value;
  return _default;
};
