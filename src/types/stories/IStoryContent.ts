/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Generic interface of IStory's 'content' property.
 *
 * @interface IStoryContent
 */
export type IStoryContent<T = Record<string, any>> = {
  readonly _uid?: string;
  readonly component: string;
  [fields: string]: any | IStoryContent[];
} & T;
