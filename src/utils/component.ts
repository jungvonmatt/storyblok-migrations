/* eslint-disable @typescript-eslint/no-explicit-any */
import { truncate } from "lodash";

export const bloksEmpty = (bloks: any) =>
  !Array.isArray(bloks) || bloks.length === 0;

export const getPreview = async (
  input: any,
): Promise<string | number | any> => {
  console.log("getPreview", input);
  const { isString, isNumber, isObject } = await import("@sindresorhus/is");

  if (isString(input)) {
    return truncate(input);
  }

  if (isNumber(input)) {
    return input;
  }

  if (Array.isArray(input)) {
    return `[${await getPreview(input[0])}]`;
  }

  if (isObject(input)) {
    return truncate(JSON.stringify(input));
  }

  return input;
};
