import CharacterToken from "@/components/character-token/character-token";
import {
  characterEntities,
  createCharacterEntity,
  findCharacter,
  findEntityById,
} from "@/data/characters";
import { findSkill } from "@/data/skills";
import { useBattleHandler } from "@/hooks/useBattleHandler";
import { sortByUUID } from "@/services/sortByUuid";
import clsx from "clsx";
import { Inter } from "next/font/google";
import Image from "next/image";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const b = useBattleHandler(
    [characterEntities[0], characterEntities[1]],
    [
      createCharacterEntity(findCharacter("Goblin"), {
        skills: ["Scimitar"],
      }),
      createCharacterEntity(findCharacter("Goblin"), {
        skills: ["Scimitar"],
      }),
    ]
  );

  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between ${inter.className}`}
    >
      <div className="fixed top-0 inset-x-0 flex flex-col items-center">
        <p className="text-2xl font-bold">{`Turn ${b.turn}`}</p>
        <div className="flex gap-x-2">
          {b.turnOrder.initiatives.map((initiative) => (
            <div key={`initiative-${initiative.id}`} className="">
              <div
                className={clsx(
                  "relative h-12 w-12",
                  !initiative.isAlive && "grayscale"
                )}
              >
                <Image
                  src={
                    findEntityById(b.characters, initiative.id).img as string
                  }
                  alt={findEntityById(b.characters, initiative.id).name}
                  fill
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col items-center mt-32 gap-y-6">
        <div className="grid grid-cols-2 gap-x-2 w-full">
          {b.enemies
            .sort((a, b) => sortByUUID(a.id, b.id))
            .map((enemy, enemyIdx) => (
              <CharacterToken
                isTargeting={
                  b.targeting.isTargeting &&
                  !findSkill(b.targeting.skillName).friendly
                }
                onClick={() => {
                  if (b.targeting.isTargeting) {
                    b.skill(
                      b.targeting.skillName,
                      b.turnOrder.initiative.id,
                      enemy.id
                    );
                    b.targeting.set(false);
                  }
                }}
                key={enemy.name + enemyIdx}
                character={enemy}
              />
            ))}
        </div>
        <div className="grid grid-cols-2 gap-x-2 w-full">
          {b.players
            .sort((a, b) => sortByUUID(a.id, b.id))
            .map((player) => (
              <CharacterToken
                key={player.id}
                isTargeting={
                  b.targeting.isTargeting &&
                  !findSkill(b.targeting.skillName).friendly
                }
                onClick={() => {
                  if (b.targeting.isTargeting) {
                    b.skill(
                      b.targeting.skillName,
                      b.turnOrder.initiative.id,
                      player.id
                    );
                    b.targeting.set(false);
                  }
                }}
                character={player}
              />
            ))}
        </div>
        <div className="fixed bottom-0 ">
          <div className="text-xs opacity-80 rounded border px-3 py-2 min-h-40 max-h-60 overflow-y-auto min-w-[30rem]">
            {b.messages.map((message, messageIdx) => (
              <div
                key={`${message}-${messageIdx}`}
                className={clsx(message.includes("missed") && "text-rose-500")}
              >
                {message}
              </div>
            ))}
          </div>
          <div className="py-6 flex gap-x-3">
            {b.players
              .find((player) => player.id === b.turnOrder.initiative.id)
              ?.skills.map((skill) => (
                <button
                  disabled={!b.turnOrder.isPlayerTurn()}
                  onClick={async () => {
                    if (b.targeting.isTargeting) {
                      b.targeting.set(false);
                    } else {
                      b.targeting.set(true, skill);
                    }
                  }}
                  key={skill}
                  className={clsx(
                    "py-3 bg-slate-100 px-3 cursor-pointer hover:bg-slate-200 rounded text-sm",
                    b.targeting.skillName === skill &&
                      "bg-rose-100 hover:bg-rose-200"
                  )}
                >
                  <p className="">{findSkill(skill).name}</p>
                </button>
              ))}
          </div>
        </div>
      </div>
    </main>
  );
}
