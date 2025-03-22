/**
 * Interface of an IStory's 'parent' property.
 *
 * @interface IStoryParent
 */
export interface IStoryParent {
  readonly id: number
  readonly slug: string
  readonly name: string
  readonly disable_fe_editor: boolean
}
