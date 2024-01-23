import { acRoll, multiRoll, roll } from "@/services/roll";
import {
  calculateAbilityModifier,
  calculateProficiency,
  calculateStatForEntity,
} from "./characters";

export const skills: Skill[] = [
  {
    name: "Greataxe",
    effect: (attacker, target) => {
      const attackRoll = roll(12);
      const attackModifier = calculateAbilityModifier(
        calculateStatForEntity(attacker, "str")
      );

      const damage = attackRoll + attackModifier;

      if (acRoll(attacker, target, "str")) {
        target = { ...target, hp: target.hp - damage };
        return {
          isSuccess: true,
          message: `${
            attacker.characterName || attacker.name
          } dealt ${damage} (${attackRoll} 1d12 + ${attackModifier} STR) damage to ${
            target.characterName || target.name
          }`,
          target,
          attacker,
        };
      }

      return {
        isSuccess: false,
        message: `${attacker.characterName || attacker.name} missed`,
        target,
        attacker,
      };
    },
    friendly: false,
  },
  {
    name: "Staff",
    effect: (attacker, target) => {
      const attackRoll = roll(6);
      const attackModifier = calculateAbilityModifier(
        calculateStatForEntity(attacker, "str")
      );

      const damage = attackRoll + attackModifier;

      if (acRoll(attacker, target, "str")) {
        target = { ...target, hp: target.hp - damage };
        return {
          isSuccess: true,
          message: `${
            attacker.characterName || attacker.name
          } dealt ${damage} (${attackRoll} 1d12 + ${attackModifier} STR) damage to ${
            target.characterName || target.name
          }`,
          target,
          attacker,
        };
      }

      return {
        isSuccess: false,
        message: `${attacker.characterName || attacker.name} missed`,
        target,
        attacker,
      };
    },
    friendly: false,
  },
  {
    name: "Scimitar",
    effect: (attacker, target) => {
      const attackRoll = roll(6);
      const attackModifier = calculateAbilityModifier(
        calculateStatForEntity(attacker, "dex")
      );

      const damage = attackRoll + attackModifier;

      if (acRoll(attacker, target, "dex")) {
        target = { ...target, hp: target.hp - damage };
        return {
          isSuccess: true,
          message: `[${attacker.id}] ${
            attacker.characterName || attacker.name
          } dealt ${damage} (${attackRoll} 1d6 + ${attackModifier}DEX) damage to ${
            target.characterName || target.name
          }`,
          target,
          attacker,
        };
      }

      return {
        isSuccess: false,
        message: `[${attacker.id}]  ${
          attacker.characterName || attacker.name
        } missed`,
        target,
        attacker,
      };
    },
    friendly: false,
  },
  {
    name: "Healing Word",
    effect: (attacker, target) => {
      const healingRoll = roll(4);
      const healingModifier = calculateAbilityModifier(
        calculateStatForEntity(attacker, "int")
      );

      const healing = healingRoll + healingModifier;

      target = { ...target, hp: target.hp + healing };
      return {
        isSuccess: true,
        message: `${attacker.characterName || attacker.name} restored ${
          healingRoll + healingModifier
        } (${healingRoll} 1d4 + ${healingModifier} INT) health to ${
          target.characterName || target.name
        }`,
        target,
        attacker,
      };
    },
    friendly: false,
  },
];

export function findSkill(name: string) {
  return skills.find((skill) => skill.name === name) as Skill;
}
