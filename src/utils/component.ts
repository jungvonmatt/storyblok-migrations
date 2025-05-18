/* eslint-disable @typescript-eslint/no-explicit-any */
import { truncate } from "lodash";

export const bloksEmpty = (bloks: any) =>
  !Array.isArray(bloks) || bloks.length === 0;

/**
 * Generates a preview string for various input types.
 *
 * @param {any} input - The input value to generate a preview for. Can be a string, number, array, or object.
 * @returns {Promise<string | number | any>} A preview representation of the input:
 *   - For strings: Truncated string
 *   - For numbers: The number as is
 *   - For arrays: A string showing the preview of the first element in brackets
 *   - For objects: A truncated JSON string representation
 *   - For other types: The input value as is
 *
 * @example
 * // String input
 * await getPreview("This is a long string") // Returns truncated string
 *
 * @example
 * // Number input
 * await getPreview(42) // Returns 42
 *
 * @example
 * // Array input
 * await getPreview(["item1", "item2"]) // Returns "[item1]"
 *
 * @example
 * // Object input
 * await getPreview({ key: "value" }) // Returns truncated JSON string
 */
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
