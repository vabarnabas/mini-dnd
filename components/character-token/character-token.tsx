import { calculateProficiency } from "@/data/characters";
import clsx from "clsx";
import Image from "next/image";
import React from "react";

interface Props {
  character: CharacterEntity;
  onClick?: () => void;
  isTargeting?: boolean;
}

export default function CharacterToken({
  character,
  onClick,
  isTargeting,
}: Props) {
  return (
    <div
      title={character.id + " " + calculateProficiency(character)}
      onClick={onClick}
      className={clsx(
        "flex gap-x-5 items-center px-3 py-1 rounded",
        isTargeting && "ring-1 cursor-pointer hover:bg-slate-50",
        character.hp <= 0 && "grayscale"
      )}
    >
      {character.img ? (
        <div className="relative h-24 w-24">
          <Image src={character.img} alt={character.name} fill />
        </div>
      ) : null}
      <div className="">
        <p className="font-semibold text-lg">{character.name}</p>
        <p className="text-sm text-rose-400">{`${Math.max(character.hp, 0)} / ${
          character.maxHp
        } HP`}</p>
        <p className="">{}</p>
      </div>
    </div>
  );
}
