/**
 * Interface of an ISpace's 'billing_address' property.
 *
 * @interface ISpaceBillingAddress
 */
export interface ISpaceBillingAddress {
  readonly name: string
  readonly address_zip: string
  readonly address_city: string
  readonly address_line1: string
  readonly address_country: string
  readonly address_iso_country: string
}
