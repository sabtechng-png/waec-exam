export function utcToLocal(utcString) {
  return new Date(utcString).toLocaleString();
}
