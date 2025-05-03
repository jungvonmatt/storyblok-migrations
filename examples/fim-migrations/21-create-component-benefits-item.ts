import { defineMigration, assetField, textField, bloksField } from "sb-migrate";

export default defineMigration({
  type: "create-component",
  schema: {
    name: "BenefitsItem",
    display_name: "Benefits Item",
    is_root: false,
    is_nestable: true,
    component_group_name: "Content",
    schema: {
      icon: assetField({
        filetypes: ["images"],
      }),
      title: textField({
        pos: 1,
        required: true,
        translatable: true,
      }),
      text_ref: bloksField({
        display_name: "Text",
        translatable: false,
        maximum: 1,
        restrict_components: true,
        component_whitelist: ["Text"],
      }),
    },
    tabs: {
      general: ["icon", "title", "text_ref"],
    },
  },
});
