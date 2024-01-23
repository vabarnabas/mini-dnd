import {
  calculateAbilityModifier,
  calculateStatForEntity,
} from "@/data/characters";
import { findSkill } from "@/data/skills";
import { multiRoll, roll } from "@/services/roll";
import { useCallback, useEffect, useMemo, useState } from "react";

interface Initiative {
  id: string;
  initiative: number;
  isAlive: boolean;
}

export function useBattleHandler(p: CharacterEntity[], e: CharacterEntity[]) {
  const [players, setPlayers] = useState(p);
  const [enemies, setEnemies] = useState(e);
  const [isTargeting, setIsTargeting] = useState(false);
  const [targetingSkillName, setTargetingSkillName] = useState("");
  const [turn, setTurn] = useState(1);
  const [subTurn, setSubTurn] = useState(1);
  const [messages, setMessages] = useState<string[]>(["Turn 1"]);

  const characters = useMemo(
    () => [...players, ...enemies],
    [enemies, players]
  );

  console.log(players, enemies);

  const rollInitiative = useCallback(() => {
    return characters
      .map((character) => {
        const initiative = multiRoll(
          roll(20),
          calculateAbilityModifier(calculateStatForEntity(character, "dex"))
        );

        return { id: character.id, initiative, isAlive: true };
      })
      .sort((a, b) => b.initiative - a.initiative);
  }, [characters]);

  const [initiatives, setInitiatives] = useState<Initiative[]>(
    rollInitiative()
  );

  const isPlayerTurn = useCallback(() => {
    if (
      players.map((player) => player.id).includes(initiatives[subTurn - 1].id)
    ) {
      return true;
    } else {
      return false;
    }
  }, [initiatives, players, subTurn]);

  const skill = useCallback(
    (name: string, attackerId: string, targetId: string) => {
      const localMessages = [];
      const skill = findSkill(name);

      const attackingCharacter = characters.find(
        (character) => character.id === attackerId
      ) as CharacterEntity;
      const targetCharacter = characters.find(
        (character) => character.id === targetId
      ) as CharacterEntity;

      const { attacker, target, message } = skill.effect(
        attackingCharacter,
        targetCharacter
      );

      localMessages.push(message);

      const enemyIndex = enemies
        .map((enemy) => enemy.id)
        .indexOf(isPlayerTurn() ? targetId : attackerId);

      const playerIndex = players
        .map((player) => player.id)
        .indexOf(!isPlayerTurn() ? targetId : attackerId);

      if (enemyIndex !== -1) {
        const enemy = isPlayerTurn()
          ? target
          : enemies.map((e) => e.id).includes(attackerId) &&
            enemies.map((e) => e.id).includes(targetId)
          ? target
          : attacker;
        setEnemies([...enemies.filter((e) => e.id !== enemy.id), enemy]);
      }
      if (playerIndex !== -1) {
        const player = !isPlayerTurn()
          ? target
          : players.map((p) => p.id).includes(attackerId) &&
            players.map((p) => p.id).includes(targetId)
          ? target
          : attacker;
        setPlayers([...players.filter((e) => e.id !== player.id), player]);
      }

      const initiative = initiatives.find(
        (initiative) => initiative.id === target.id
      ) as Initiative;

      if (initiative.isAlive === true && target.hp <= 0) {
        initiative.isAlive = false;
        localMessages.push(`${target.name} died`);
      } else if (initiative.isAlive === false && target.hp > 0) {
        initiative.isAlive = true;
        localMessages.push(`${target.name} resurrected`);
      }

      setInitiatives(
        [
          ...initiatives.filter((initiative) => initiative.id !== target.id),
          initiative,
        ].sort((a, b) => b.initiative - a.initiative)
      );

      if (subTurn < initiatives.length) {
        setSubTurn(subTurn + 1);
      } else {
        setSubTurn(1);
        setTurn(turn + 1);
        localMessages.push(`Turn ${turn + 1}`);
      }

      setMessages([...messages, ...localMessages]);
    },
    [
      enemies,
      messages,
      turn,
      subTurn,
      initiatives,
      characters,
      isPlayerTurn,
      players,
    ]
  );

  const turnOrder = {
    turn,
    subTurn,
    initiatives,
    initiative: initiatives[subTurn - 1],
    isPlayerTurn,
  };

  const targeting = {
    isTargeting,
    skillName: targetingSkillName,
    set: (value: boolean, skillName?: string) => {
      setIsTargeting(value);
      setTargetingSkillName(skillName || "");
    },
  };

  useEffect(() => {
    const initiative = initiatives[subTurn - 1];
    const character = characters.find(
      (enemy) => enemy.id === initiative.id
    ) as CharacterEntity;

    const processNextTurn = () => {
      if (
        players.filter((player) => player.hp > 0).length &&
        enemies.filter((enemy) => enemy.hp > 0).length
      ) {
        if (!isPlayerTurn()) {
          if (character.hp > 0) {
            skill(
              character.skills[0],
              initiative.id,
              players.filter((player) => player.hp > 0)[
                roll(players.filter((player) => player.hp > 0).length) - 1
              ].id
            );
          } else {
            if (subTurn < initiatives.length) {
              setSubTurn(subTurn + 1);
            } else {
              setSubTurn(1);
              setTurn(turn + 1);
            }
          }
        } else {
          if (character.hp <= 0) {
            if (subTurn < initiatives.length) {
              setSubTurn(subTurn + 1);
            } else {
              setSubTurn(1);
              setTurn(turn + 1);
            }
          }
        }
      }
    };

    // Check if the character is alive before applying the delay
    if (character.hp > 0) {
      // Wait for 1 second (adjust the delay as needed)
      const delay = 1000;
      const timeoutId = setTimeout(() => {
        processNextTurn();
      }, delay);

      // Clear the timeout on component unmount or when the turn changes
      return () => clearTimeout(timeoutId);
    } else {
      // If the character is not alive, proceed without delay
      processNextTurn();
    }
  }, [
    characters,
    initiatives,
    isPlayerTurn,
    skill,
    subTurn,
    turn,
    players,
    enemies,
  ]);

  return {
    players,
    enemies,
    turn,
    messages,
    skill,
    targeting,
    turnOrder,
    characters,
  };
}
