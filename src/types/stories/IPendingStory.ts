import { IStoryContent } from "./IStoryContent";

/**
 * Interface of a pending story info object.
 *
 * @export
 * @interface IPendingStory
 */
export interface IPendingStory {
  name: string;
  parent_id?: number;
  group_id?: string;
  sort_by_date?: boolean | null;
  tag_list?: string[];
  is_folder?: boolean;
  content?: IStoryContent;
  slug: string;
  path?: string | null;
  default_root?: string | null;
  disble_fe_editor?: boolean;
  is_startpage?: boolean;
  pinned?: boolean;
}
