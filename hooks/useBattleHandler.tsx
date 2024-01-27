import {
  calculateAbilityModifier,
  calculateStatForEntity,
} from "@/data/characters";
import { challengeExp } from "@/data/exp";
import { findAction } from "@/data/actions";
import { multiRoll, roll } from "@/services/roll";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CONDITION,
  DIED,
  EXP_GAIN,
  RESURRECTED,
  messageConstructor,
} from "@/services/messageGenerator";

interface Initiative {
  id: string;
  initiative: number;
  isAlive: boolean;
  isSurprised?: boolean;
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
        players.forEach((player) => {
          setMessages((prevMessages) => [
            ...prevMessages,
            messageConstructor(EXP_GAIN, {
              targetId: player.id,
              exp: expGain.toString(),
            }),
          ]);
        });
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

  const updateCharacter = useCallback(
    (id: string, update: Omit<Partial<CharacterEntity>, "id">) => {
      if (players.some((player) => player.id === id)) {
        setPlayers((prevPlayers) => [
          ...prevPlayers.filter((player) => player.id !== id),
          {
            ...(prevPlayers.find(
              (player) => player.id === id
            ) as CharacterEntity),
            ...update,
          },
        ]);
      } else if (enemies.some((enemy) => enemy.id === id)) {
        setEnemies((prevEnemies) => [
          ...prevEnemies.filter((enemy) => enemy.id !== id),
          {
            ...(prevEnemies.find(
              (enemy) => enemy.id === id
            ) as CharacterEntity),
            ...update,
          },
        ]);
      }
    },
    [players, enemies]
  );

  const onTurnEnd = useCallback(() => {
    if (subTurn < initiatives.length) {
      setSubTurn((prevSubTurn) => prevSubTurn + 1);
    } else {
      setSubTurn(1);
      setTurn((prevTurn) => prevTurn + 1);
      setMessages((prevMessages) => [...prevMessages, `Turn ${turn + 1}`]);
      characters
        .filter((character) => !!character.conditions?.length)
        .forEach((character) => {
          updateCharacter(character.id, {
            conditions: (character.conditions as Condition[])
              .filter((condition) => condition.turnsLeft - 1 > 0)
              .map((condition) => ({
                name: condition.name,
                turnsLeft: condition.turnsLeft - 1,
              })),
          });
        });
    }
  }, [initiatives, subTurn, turn, characters, updateCharacter]);

  const isPlayerTurn = useCallback(() => {
    return (
      players.find((player) => player.id === initiatives[subTurn - 1].id) !==
      undefined
    );
  }, [initiatives, players, subTurn]);

  const haveCondition = useCallback(
    (id: string, condition: string) => {
      return !!characters
        .find((character) => character.id === id)
        ?.conditions?.map((condition) => condition.name)
        .includes(condition);
    },
    [characters]
  );

  const action = useCallback(
    (name: string, attackerId: string, targetId: string) => {
      if (haveCondition(attackerId, "Surprised")) {
        setMessages((prevMessages) => [
          ...prevMessages,
          messageConstructor(CONDITION, { attackerId, condition: "surprised" }),
        ]);
      } else {
        const localMessages: string[] = [];
        const skill = findAction(name);

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
          const { id, ...enemy } = isPlayerTurn()
            ? target
            : enemies.map((e) => e.id).includes(attackerId) &&
              enemies.map((e) => e.id).includes(targetId)
            ? target
            : attacker;
          updateCharacter(id, enemy);
        }
        if (playerIndex !== -1) {
          const { id, ...player } = !isPlayerTurn()
            ? target
            : players.map((p) => p.id).includes(attackerId) &&
              players.map((p) => p.id).includes(targetId)
            ? target
            : attacker;
          updateCharacter(id, player);
        }

        const initiative = initiatives.find(
          (initiative) => initiative.id === target.id
        ) as Initiative;

        if (initiative.isAlive === true && target.hp <= 0) {
          initiative.isAlive = false;
          localMessages.push(messageConstructor(DIED, { targetId: target.id }));
        } else if (!initiative.isAlive && target.hp > 0) {
          initiative.isAlive = true;
          localMessages.push(
            messageConstructor(RESURRECTED, { targetId: target.id })
          );
        }

        setInitiatives(
          [
            ...initiatives.filter((initiative) => initiative.id !== target.id),
            initiative,
          ].sort((a, b) => b.initiative - a.initiative)
        );

        setMessages((prevMessages) => [...prevMessages, ...localMessages]);
      }

      onTurnEnd();
    },
    [
      enemies,
      initiatives,
      characters,
      isPlayerTurn,
      players,
      onTurnEnd,
      haveCondition,
      updateCharacter,
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
            onTurnEnd();
          }
        } else {
          if (character.hp <= 0) {
            onTurnEnd();
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
    [battleEnded, players, enemies, isPlayerTurn, endBattle, action, onTurnEnd]
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
