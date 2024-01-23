import { multiRoll, roll } from "@/services/roll";
import { findCharacterClass } from "./classes";
import { v4 as uuidv4 } from "uuid";

export const character: Character[] = [
  {
    name: "Goblin",
    characterClass: findCharacterClass("Enemy"),
    str: 8,
    dex: 14,
    con: 10,
    int: 10,
    wis: 8,
    cha: 8,
    proficiency: roll(4),
    hpCalc: () => multiRoll(roll(6), roll(6)),
    img: "https://5e.tools/img/MM/Goblin.png",
    ac: 15,
  },
];

export function findCharacter(name: string) {
  return character.find((character) => character.name === name) as Character;
}

export function findEntityById(entities: CharacterEntity[], id: string) {
  return entities.find((entity) => entity.id === id) as CharacterEntity;
}

export const characterEntities: CharacterEntity[] = [
  {
    id: uuidv4(),
    characterClass: findCharacterClass("Barbarian"),
    hp: 15,
    maxHp: 15,
    str: 17,
    dex: 10,
    con: 16,
    int: 13,
    wis: 10,
    cha: 11,
    level: 1,
    name: "Barni",
    skills: ["Greataxe"],
    img: "https://5e.tools/img/MPMM/Apprentice%20Wizard.png",
    ac: 10,
  },
  {
    id: uuidv4(),
    characterClass: findCharacterClass("Barbarian"),
    hp: 10,
    maxHp: 10,
    str: 11,
    dex: 9,
    con: 14,
    int: 18,
    wis: 17,
    cha: 12,
    level: 1,
    name: "Theseus",
    skills: ["Staff", "Healing Word"],
    img: "https://5e.tools/img/SCC/First-Year%20Student.png",
    ac: 10,
  },
];

export function createCharacterEntity(
  character: Character,
  options?: {
    level?: number;
    skills?: string[];
  }
): CharacterEntity {
  const { hpCalc, ...rest } = character;
  const maxHp = hpCalc();
  return {
    ...rest,
    id: uuidv4(),
    maxHp,
    hp: maxHp,
    level: options?.level || 1,
    skills: options?.skills || ["Greataxe"],
  };
}

export function calculateStatForEntity(
  entity: CharacterEntity,
  stat: "con" | "str" | "dex" | "int" | "wis"
) {
  return entity[stat];
}

export function calculateAbilityModifier(score: number) {
  return Math.floor((score - 10) / 2);
}

export function calculateLevelUpHealth(entity: CharacterEntity) {
  return (
    roll(entity.characterClass.hitDie) +
    calculateAbilityModifier(calculateStatForEntity(entity, "con"))
  );
}

export function calculateProficiency(entity: CharacterEntity) {
  if (entity.proficiency) return entity.proficiency;

  return 1 + Math.ceil(entity.level / 4);
}
