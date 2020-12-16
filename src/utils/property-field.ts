/**
 * Example: "Enum|Language"  => "Enum"
 * @param type type in basic resources
 */
export function getMainType(type: string) {
  if (type.indexOf('|') === -1) return '';
  const typeArr = type.split('|');
  return typeArr[0];
}
