export const getOrThrow = <T>(value: T | null | undefined, message = ''): T => {
  if (value !== null && value !== undefined) return value;
  throw Error(message);
};
