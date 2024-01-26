import { acRoll, multiRoll, roll } from "@/services/roll";
import { calculateAbilityModifier, calculateStatForEntity } from "./characters";
import {
  ATTACK_HIT,
  ATTACK_MISS,
  RESTORATION_HIT,
  messageConstructor,
} from "@/services/messageGenerator";

export const actions: Action[] = [
  {
    name: "Greataxe",
    effect: (attacker, target) => {
      const attackRoll = roll(12);
      const attackModifier = calculateAbilityModifier(
        calculateStatForEntity(attacker, "str")
      );

      const damage = attackRoll + attackModifier;

      if (acRoll(attacker, target, "str")) {
        target = { ...target, hp: Math.max(0, target.hp - damage) };
        return {
          isSuccess: true,
          message: messageConstructor(ATTACK_HIT, {
            attackerId: attacker.id,
            targetId: target.id,
            damage: damage.toString(),
            attackRoll: attackRoll.toString(),
            attackType: "1d12",
            attackModifier: "STR",
          }),
          target,
          attacker,
        };
      }

      return {
        isSuccess: false,
        message: messageConstructor(ATTACK_MISS, { attackerId: attacker.id }),
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
        target = { ...target, hp: Math.max(0, target.hp - damage) };
        return {
          isSuccess: true,
          message: messageConstructor(ATTACK_HIT, {
            attackerId: attacker.id,
            targetId: target.id,
            damage: damage.toString(),
            attackRoll: attackRoll.toString(),
            attackType: "1d6",
            attackModifier: "STR",
          }),
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
        target = { ...target, hp: Math.max(0, target.hp - damage) };
        return {
          isSuccess: true,
          message: messageConstructor(ATTACK_HIT, {
            attackerId: attacker.id,
            targetId: target.id,
            damage: damage.toString(),
            attackRoll: attackRoll.toString(),
            attackType: "1d6",
            attackModifier: "DEX",
          }),
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

      target = { ...target, hp: Math.min(target.maxHp, target.hp + healing) };
      return {
        isSuccess: true,
        message: messageConstructor(RESTORATION_HIT, {
          attackerId: attacker.id,
          targetId: target.id,
          restoration: healing.toString(),
          restorationRoll: healingRoll.toString(),
          restorationType: "1d6",
          restorationModifier: "DEX",
        }),
        target,
        attacker,
      };
    },
    friendly: false,
  },
];

export function findAction(name: string) {
  return actions.find((skill) => skill.name === name) as Action;
}
