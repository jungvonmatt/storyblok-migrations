import {
  defineMigration,
  bloksField,
  textField,
  optionField,
  booleanField,
} from "sb-migrate";

export default defineMigration({
  type: "create-component",
  schema: {
    name: "BrandList",
    display_name: "Brand List",
    is_root: false,
    is_nestable: true,
    component_group_name: "Content",
    schema: {
      headline_ref: bloksField({
        pos: 0,
        maximum: 1,
        translatable: false,
        restrict_components: true,
        component_whitelist: ["Headline"],
      }),
      category: optionField({
        display_name: "Category",
        source: "internal",
        datasource_slug: "brand-list-category",
      }),
      id: textField({
        display_name: "Id",
        regex: "^([a-zA-Z]+(?:[a-zA-Z0-9\\-_.:]+)*)*$",
        description:
          'Id of this element (must start with letter)\n(only characters, numbers, "_", ".", ":" and "-",eg. "Test-Id-2")',
      }),
      margin_top: optionField({
        display_name: "Margin Top",
        source: "internal",
        default_value: "none",
        datasource_slug: "margin",
      }),
      is_containered: booleanField({
        display_name: "Is Containered",
        default_value: false,
      }),
    },
    tabs: {
      general: ["headline_ref", "category"],
      settings: ["id", "margin_top", "is_containered"],
    },
  },
});
