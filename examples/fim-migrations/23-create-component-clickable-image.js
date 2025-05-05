import { defineMigration, bloksField, textField } from "sb-migrate";

export default defineMigration({
  type: "create-component",
  schema: {
    name: "ClickableImage",
    display_name: "Clickable Image",
    is_root: false,
    is_nestable: true,
    component_group_name: "Media",
    schema: {
      image: bloksField({
        display_name: "Image",
        pos: 1,
        maximum: 1,
        restrict_components: true,
        component_whitelist: ["Image"],
      }),
      cta_ref: bloksField({
        display_name: "Call to Action",
        pos: 2,
        maximum: 1,
        translatable: false,
        restrict_components: true,
        component_whitelist: ["Link"],
      }),
      creative_name: textField({
        display_name: "Creative Name",
      }),
      promotion_name: textField({
        display_name: "Promotion Name",
      }),
    },
    tabs: {
      general: ["image", "cta_ref"],
      settings: ["creative_name", "promotion_name"],
      deprecated: [
        "cta_url",
        "cta_label",
        "id_target",
        "cta_target_blank",
        "object_fit",
        "object_position",
      ],
    },
  },
});
