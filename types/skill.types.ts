interface ActionEffect {
  isSuccess: boolean;
  message: string;
  attacker: CharacterEntity;
  target: CharacterEntity;
}

interface Action {
  name: string;
  description?: string;
  effect: (attacker: CharacterEntity, target: CharacterEntity) => ActionEffect;
  friendly: boolean;
}
