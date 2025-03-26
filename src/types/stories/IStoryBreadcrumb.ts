/**
 * Interface of an IStory's 'breadcrumbs' array property member.
 *
 * @interface IStoryBreadcrumb
 */
export interface IStoryBreadcrumb {
  readonly id: number
  readonly name: string
  readonly parent_id: number
  readonly disable_fe_editor: boolean
}
