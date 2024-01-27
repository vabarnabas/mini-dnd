export const ATTACK_HIT =
  "--char(:attackerId) dealt :damage --dmg(:attackRoll :attackType + :attackModifier) damage to --char(:targetId)";

export const RESTORATION_HIT =
  "--char(:attackerId) restored :restoration --dmg(:restorationRoll :restorationType + :restorationModifier) health to --char(:targetId)";

export const CONDITION = "--char(:attackerId) is :condition";

export const DIED = "--char(:targetId) died";

export const RESURRECTED = "--char(:targetId) resurrected";

export const MISS = "--char(:attackerId) missed";

export const EXP_GAIN = "--char(:targetId) gained :exp EXP";

export function messageConstructor<S extends string>(
  template: S,
  params: Record<string, string>
): string {
  let localString: string = template;

  if (!params) return localString;

  const placeholders = template.match(/:\w+/g) || [];

  placeholders.forEach((placeholder) => {
    const key = placeholder.substring(1) as keyof typeof params;
    const param = String(params[key]);

    if (typeof param === "string" && localString.includes(placeholder)) {
      localString = localString.replace(placeholder, param);
    }
  });

  return localString;
}
