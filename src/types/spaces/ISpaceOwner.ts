/**
 * /**
 * Interface of an ISpace's 'owner' property.
 *
 * @interface ISpaceOwner
 */
export interface ISpaceOwner {
  readonly userid: string
  readonly email: string
  readonly organization: string | null
  readonly username: string | null
  readonly use_username: boolean
  readonly alt_email: string | null
  readonly firstname: string
  readonly lastname: string
  readonly phone: string | null
  readonly id: number
  readonly login_strategy: string
  readonly created_at: string
}

