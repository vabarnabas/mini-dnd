import { findAction } from "@/data/actions";

export class BattleHandler {
  player: CharacterEntity;
  enemy: CharacterEntity;
  turn: number = 1;
  messages: string[] = [];

  constructor(player: CharacterEntity, enemy: CharacterEntity) {
    this.player = player;
    this.enemy = enemy;
  }

  skill(name: string, isPlayerTurn?: boolean) {
    const skill = findAction(name);
    const { attacker, target, message } = isPlayerTurn
      ? skill.effect(this.player, this.enemy)
      : skill.effect(this.enemy, this.player);
    console.log(message);
    this.player = isPlayerTurn ? attacker : target;
    this.enemy = isPlayerTurn ? target : attacker;
    this.turn += 1;
  }
}
