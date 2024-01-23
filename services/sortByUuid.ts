export function sortByUUID(a: string, b: string) {
  const uuidA = a.replace(/-/g, "");
  const uuidB = b.replace(/-/g, "");
  const bigintA = BigInt("0x" + uuidA);
  const bigintB = BigInt("0x" + uuidB);

  if (bigintA < bigintB) {
    return -1;
  } else if (bigintA > bigintB) {
    return 1;
  } else {
    return 0;
  }
}
