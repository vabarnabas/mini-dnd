import {
  calculateAbilityModifier,
  calculateStatForEntity,
} from "@/data/characters";
import { challengeExp } from "@/data/exp";
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
  const [battleEnded, setBattleEnded] = useState(false);

  const characters = useMemo(
    () => [...players, ...enemies],
    [enemies, players]
  );

  const endBattle = useCallback(
    (isVictory?: boolean) => {
      if (isVictory) {
        setMessages((prevMessages) => [...prevMessages, "You have won"]);
        const expGain = enemies.reduce((acc, curr) => {
          if (curr.cr) {
            const entries = Object.entries(challengeExp);
            const value = entries.find((entry) => entry[0] === curr.cr) as [
              string,
              number
            ];
            return acc + value[1];
          }
          return acc;
        }, 0);

        const updatedPlayers = players.map((player) => ({
          ...player,
          exp: player.exp + expGain,
        }));

        setPlayers(updatedPlayers);
      }
    },
    [enemies, players]
  );

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
    return (
      players.find((player) => player.id === initiatives[subTurn - 1].id) !==
      undefined
    );
  }, [initiatives, players, subTurn]);

  const action = useCallback(
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
      } else if (!initiative.isAlive && target.hp > 0) {
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

  const processNextTurn = useCallback(
    (character: CharacterEntity, initiative: Initiative) => {
      if (
        players.filter((player) => player.hp > 0).length &&
        enemies.filter((enemy) => enemy.hp > 0).length
      ) {
        if (!isPlayerTurn()) {
          if (character.hp > 0) {
            action(
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
      } else {
        if (!battleEnded) {
          setBattleEnded(true);
          if (players.filter((player) => player.hp > 0).length) {
            endBattle(true);
          } else {
            endBattle(false);
          }
        }
      }
    },
    [
      battleEnded,
      players,
      enemies,
      initiatives,
      isPlayerTurn,
      endBattle,
      turn,
      subTurn,
      action,
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

    if (character.hp > 0) {
      const delay = 1000;
      const timeoutId = setTimeout(() => {
        processNextTurn(character, initiative);
      }, delay);

      return () => clearTimeout(timeoutId);
    } else {
      processNextTurn(character, initiative);
    }
  }, [initiatives, subTurn, processNextTurn, characters]);

  return {
    battleEnded,
    players,
    enemies,
    messages,
    action,
    targeting,
    turnOrder,
    characters,
  };
}
