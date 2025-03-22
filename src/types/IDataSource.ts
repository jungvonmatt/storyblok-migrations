/* eslint-disable @typescript-eslint/no-explicit-any */
export interface IPendingDataSource {
  name: string;
  slug: string;
}

export interface IDataSource extends IPendingDataSource {
  id: number;
  dimensions: any[];
  created_at: string;
  updated_at: string;
}

export interface IPendingDataSourceEntry {
  name: string;
  value: string;
  datasource_id: number;
}

export interface IDataSourceEntry
  extends Omit<IPendingDataSourceEntry, "datasource_id"> {
  id: number;
  dimension_value?: null | string;
}
