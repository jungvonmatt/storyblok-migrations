export interface IComponentGroup {
  name: string;
  id?: number;
  uuid?: string;
  parent_id?: number;
  parent_uuid?: string;
}

export interface IPendingComponentGroup {
  name: string;
  parent_id?: number;
  parent_uuid?: string;
}
