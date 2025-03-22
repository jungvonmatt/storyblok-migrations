/* eslint-disable @typescript-eslint/no-explicit-any */
import { IPendingStory } from "./IPendingStory";
import { IStoryBreadcrumb } from "./IStoryBreadcrumb";
import { IStoryLastAuthor } from "./IStoryLastAuthor";
import { IStoryParent } from "./IStoryParent";
import { IStoryPreviewToken } from "./IStoryPreviewToken";

/**
 * Interface of a Storyblok content story information object.
 *
 * @export
 * @interface IStory
 * @extends {IPendingStory}
 */
export interface IStory extends IPendingStory {
  readonly alternates?: any[];
  readonly created_at?: string;
  readonly updated_at?: string;
  readonly published_at?: string | null;
  readonly id?: number;
  readonly uuid?: string;
  readonly published?: boolean;
  readonly full_slug?: string;
  readonly parent?: IStoryParent | null;
  readonly unpublished_changes?: boolean;
  readonly meta_data?: any;
  readonly imported_at?: string | null;
  readonly preview_token?: IStoryPreviewToken;
  pinned?: boolean;
  readonly breadcrumbs?: IStoryBreadcrumb[];
  readonly publish_at?: string | null;
  readonly expire_at?: string | null;
  readonly last_author?: IStoryLastAuthor;
}
