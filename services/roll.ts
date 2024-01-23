import {
  calculateAbilityModifier,
  calculateProficiency,
  calculateStatForEntity,
} from "@/data/characters";

export function roll(sides: number) {
  return Math.floor(Math.random() * sides) + 1;
}

export function multiRoll(...args: number[]) {
  return args.reduce((acc, curr) => acc + curr, 0);
}

export function acRoll(
  attacker: CharacterEntity,
  target: CharacterEntity,
  stat: "con" | "str" | "dex" | "int" | "wis"
) {
  const toHit =
    calculateProficiency(attacker) +
    calculateAbilityModifier(calculateStatForEntity(attacker, stat));
  return multiRoll(roll(20), toHit) >= target.ac;
}
