export const ATTACK_HIT =
  "::char(:attackerId) dealt :damage ::dmg(:attackRoll :attackType + :attackModifier) damage to ::char(:targetId)";

export const RESTORATION_HIT =
  "::char(:attackerId) restored :restoration ::dmg(:restorationRoll :restorationType + :restorationModifier) health to ::char(:targetId)";

export const ATTACK_MISS = "::char(:attackerId) missed";

export function messageConstructor(
  template: string,
  params: Record<string, string>
) {
  let localString: string = template;

  if (!params) return localString;

  Object.keys(params).forEach((key) => {
    const param = String(params[key]);

    if (typeof param === "string" && localString.includes(`:${key}`)) {
      localString = localString.replace(`:${key}`, param);
    }
  });

  return localString;
}
