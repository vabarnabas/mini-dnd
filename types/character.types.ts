interface Character extends Stat {
  name: string;
  characterClass: CharacterClass;
  hpCalc: () => number;
  img?: string;
  proficiency?: number;
  ac: number;
}

interface CharacterEntity extends Omit<Character, "hpCalc"> {
  id: string;
  characterName?: string;
  hp: number;
  maxHp: number;
  level: number;
  skills: string[];
}
