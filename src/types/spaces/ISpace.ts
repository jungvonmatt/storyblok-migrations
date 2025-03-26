/* eslint-disable @typescript-eslint/no-explicit-any */
import { ISpaceBillingAddress } from "./ISpaceBillingAddress";
import { ISpaceLimits } from "./ISpaceLimits";
import { ISpaceOwner } from "./ISpaceOwner";
import { ISpaceUser } from "./ISpaceUser";

/**
 * Interface of a Storyblok space information object.
 *
 * @interface ISpace
 */
export interface ISpace {
  name: string;
  domain: string;
  uniq_domain: string | null;
  readonly plan: string;
  readonly plan_level: number;
  readonly limits: ISpaceLimits;
  readonly created_at: string;
  readonly id: number;
  readonly role: string;
  owner_id: number;
  readonly story_published_hook: string | null;
  readonly environments: Array<{
    name: string;
    location: string;
  }>;
  readonly stories_count: number;
  parent_id: number | null;
  readonly assets_count: number;
  readonly searchblok_id: string | null;
  readonly duplicatable: boolean | null;
  readonly request_count_today: number;
  readonly api_requests: number;
  readonly exceeded_requests: number;
  readonly billing_address: ISpaceBillingAddress;
  readonly routes: string[] | null;
  readonly euid: string;
  readonly trial: boolean;
  default_root: string;
  readonly has_slack_webhook: string;
  readonly first_token: string;
  readonly collaborators: ISpaceUser[];
  readonly settings: any[];
  readonly owner: ISpaceOwner;
  readonly traffic_limit: number;
  readonly has_pending_tasks: boolean;
  readonly options: {
    is_demo: boolean;
    force_v1: boolean;
    force_v2: boolean;
    component_groups: Array<{
      id: number;
      name: string;
      uuid: string;
    }>;
    languages: Array<{
      code: string;
      name: string;
    }>;
    hosted_backup: boolean;
    duplicated_from: number;
    track_statistics: boolean;
    required_assest_fields: string[];
    use_translated_stories: boolean;
    asset_custom_meta_data_schema: any[];
  };
  assistance_mode: boolean;
  crawl_config: Record<string, any>;
  org: {
    name: string;
  };
  languages: Array<{
    code: string;
    name: string;
  }>;
  feature_limits: Array<{
    key: string;
    origin: string;
    limit: string;
    limit_type: string;
    is_available: boolean;
  }>;
}
