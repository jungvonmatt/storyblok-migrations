/**
 * Interface of an ISpace's 'limits' property.
 *
 * @interface ISpaceLimits
 */
export interface ISpaceLimits {
  readonly plan_level: number
  readonly api_requests: number
  readonly has_custom_ssl: boolean
  readonly max_collaborators: number
}
