export function replaceAt(arr, index, value) {
  const result = arr.slice(0);
  result[index] = value;
  return result;
}
