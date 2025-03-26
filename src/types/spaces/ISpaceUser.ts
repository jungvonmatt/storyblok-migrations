export type ISpaceUser = {
  user: {
    id: number;
    firstname: string | null;
    lastname: string | null;
    alt_email: string | null;
    avatar: string | null;
    userid: string;
    friendly_name: string;
  };
  role: string;
  user_id: number;
  permissions: string[];
  allowed_path: string;
  field_permissions: string;
  id: number;
  space_role_id: number | null;
  invitation: unknown | null;
  space_role_ids: string[];
  space_id: number;
  can_act_as_admin: false;
};
