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

export function useBattleHandler(
  initialPlayers: CharacterEntity[],
  initialEnemies: CharacterEntity[]
) {
  const [players, setPlayers] = useState(initialPlayers);
  const [enemies, setEnemies] = useState(initialEnemies);
  const [isTargeting, setIsTargeting] = useState(false);
  const [targetingSkillName, setTargetingSkillName] = useState("");
  const [turn, setTurn] = useState(1);
  const [subTurn, setSubTurn] = useState(1);
  const [messages, setMessages] = useState<string[]>([]);

  const characters = useMemo(
    () => [...players, ...enemies],
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

  const [initiatives, setInitiatives] = useState<Initiative[]>(rollInitiative);

  const isPlayerTurn = useCallback(() => {
    return players
      .map((player) => player.id)
      .includes(initiatives[subTurn - 1]?.id);
  }, [initiatives, players, subTurn]);

  const updateCharacterState = useCallback(
    (characterToUpdate: CharacterEntity) => {
      const isEnemy = enemies
        .map((enemy) => enemy.id)
        .includes(characterToUpdate.id);

      if (isEnemy) {
        setEnemies((prevEnemies) =>
          prevEnemies.map((enemy) =>
            enemy.id === characterToUpdate.id ? characterToUpdate : enemy
          )
        );
      } else {
        setPlayers((prevPlayers) =>
          prevPlayers.map((player) =>
            player.id === characterToUpdate.id ? characterToUpdate : player
          )
        );
      }
    },
    [enemies, setEnemies, players, setPlayers]
  );

  const handleCharacterDeath = useCallback(
    (deadCharacter: CharacterEntity) => {
      const initiative = initiatives.find(
        (init) => init.id === deadCharacter.id
      ) as Initiative;
      initiative.isAlive = false;

      setInitiatives((prevInitiatives) =>
        [
          ...prevInitiatives.filter((init) => init.id !== deadCharacter.id),
          initiative,
        ].sort((a, b) => b.initiative - a.initiative)
      );

      setMessages((prevMessages) => [
        ...prevMessages,
        `${deadCharacter.name} died`,
      ]);
    },
    [initiatives, setInitiatives, setMessages]
  );

  const skill = useCallback(
    (name: string, attackerId: string, targetId: string) => {
      const localMessages: string[] = [];
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

      updateCharacterState(target);

      if (target.hp <= 0) {
        handleCharacterDeath(target);
      }

      if (subTurn < initiatives.length) {
        setSubTurn((prevSubTurn) => prevSubTurn + 1);
      } else {
        setSubTurn(1);
        setTurn((prevTurn) => prevTurn + 1);
      }

      setMessages((prevMessages) => [...prevMessages, ...localMessages]);
    },
    [
      characters,
      subTurn,
      initiatives.length,
      setSubTurn,
      setTurn,
      updateCharacterState,
      handleCharacterDeath,
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
      (char) => char.id === initiative.id
    ) as CharacterEntity;

    if (
      players.some((player) => player.hp > 0) &&
      enemies.some((enemy) => enemy.hp > 0)
    ) {
      if (!isPlayerTurn()) {
        if (character.hp > 0) {
          const alivePlayers = players.filter((player) => player.hp > 0);
          const randomPlayer = alivePlayers[roll(alivePlayers.length) - 1];
          skill(character.skills[0], initiative.id, randomPlayer.id);
        } else {
          if (subTurn < initiatives.length) {
            setSubTurn((prevSubTurn) => prevSubTurn + 1);
          } else {
            setSubTurn(1);
            setTurn((prevTurn) => prevTurn + 1);
          }
        }
      } else {
        if (character.hp <= 0) {
          if (subTurn < initiatives.length) {
            setSubTurn((prevSubTurn) => prevSubTurn + 1);
          } else {
            setSubTurn(1);
            setTurn((prevTurn) => prevTurn + 1);
          }
        }
      }
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
