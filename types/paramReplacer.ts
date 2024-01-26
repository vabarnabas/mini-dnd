export default function paramReplacer(
  path: string,
  params?: Record<string, string>
): string {
  let localString: string = path;

  if (params === undefined) {
    return localString;
  }

  Object.keys(params).forEach((key) => {
    const param = params[key];

    if (typeof param === "string" && localString.includes(`:${key}`)) {
      localString = localString.replace(`:${key}`, param);
    }
  });

  return localString;
}
