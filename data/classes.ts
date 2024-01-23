export const characterClasses: CharacterClass[] = [
  {
    name: "Barbarian",
    con: 0,
    dex: 0,
    int: 0,
    str: 13,
    wis: 0,
    cha: 0,
    hitDie: 12,
  },
  { name: "Enemy", con: 0, dex: 0, int: 0, str: 0, wis: 0, cha: 0, hitDie: 6 },
];

export function findCharacterClass(name: string) {
  return characterClasses.find(
    (characterClass) => characterClass.name === name
  ) as CharacterClass;
}
