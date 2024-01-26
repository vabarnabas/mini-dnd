import clsx from "clsx";

interface Props {
  text: string;
  characters: CharacterEntity[];
  messageIndex: number;
}

const classNames = (part: string, className?: string) => {
  return clsx(className, {
    "text-rose-500": part.includes("missed"),
    "text-emerald-500": part.includes("won"),
    "font-semibold text-base mb-1": part.includes("Turn"),
  });
};

const parseText = (
  text: string,
  characters: CharacterEntity[],
  messageIndex: number
) => {
  const parts = text.split(/(::char\([^)]+\)|::dmg\([^)]+\))/);

  return (
    <div className={classNames(text, "inline")}>
      {parts.map((part, index) => {
        if (part.startsWith("::char(")) {
          const id = part.match(/\(([^)]+)\)/)?.[1];
          return (
            <span
              key={`${part}-${index}-${messageIndex}`}
              className="underline"
            >
              {characters.find((character) => character.id === id)?.name ||
                "asd"}
            </span>
          );
        } else if (part.startsWith("::dmg(")) {
        } else {
          return (
            <span
              title={
                parts[index + 1] && parts[index + 1].startsWith("::dmg(")
                  ? parts[index + 1].match(/\((.*?)\)/)?.[1]
                  : ""
              }
              key={`${part}-${index}-${messageIndex}`}
              className={classNames(part)}
            >
              {part}
            </span>
          );
        }
      })}
    </div>
  );
};

export default function MessageLine({ text, characters, messageIndex }: Props) {
  return <div>{parseText(text, characters, messageIndex)}</div>;
}
