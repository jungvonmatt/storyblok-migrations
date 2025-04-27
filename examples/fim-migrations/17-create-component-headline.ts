import {
  defineMigration,
  textField,
  optionField,
  customField,
} from "sb-migrate";

export default defineMigration({
  type: "create-component",
  schema: {
    name: "Headline",
    display_name: "Headline",
    is_root: false,
    is_nestable: true,
    component_group_name: "Contents",
    schema: {
      text: textField({
        translatable: true,
        required: true,
      }),
      weight: optionField({
        source: "internal",
        datasource_slug: "headline-weight",
        default_value: "semibold",
      }),
      look: optionField({
        source: "internal",
        datasource_slug: "headline-look",
        default_value: "h1",
      }),
      tag: optionField({
        source: "internal",
        datasource_slug: "headline-tag",
        default_value: "h2",
      }),
      color: customField({
        field_type: "storyblok-colorpicker",
        options: [],
      }),
    },
    tabs: {
      General: ["text"],
      Settings: ["look", "tag", "weight", "color"],
      Deprecated: ["label"],
    },
  },
});
