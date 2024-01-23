interface SkillEffect {
  isSuccess: boolean;
  message: string;
  attacker: CharacterEntity;
  target: CharacterEntity;
}

interface Skill {
  name: string;
  description?: string;
  effect: (attacker: CharacterEntity, target: CharacterEntity) => SkillEffect;
  friendly: boolean;
}
