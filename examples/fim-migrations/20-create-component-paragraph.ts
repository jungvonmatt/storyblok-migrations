import {
  defineMigration,
  bloksField,
  textField,
  optionField,
  booleanField,
  customField,
} from "sb-migrate";

export default defineMigration({
  type: "create-component",
  schema: {
    name: "Paragraph",
    display_name: "Paragraph",
    is_root: false,
    is_nestable: true,
    component_group_name: "Content",
    schema: {
      headline_ref: bloksField({
        display_name: "Headline",
        maximum: 1,
        translatable: false,
        restrict_components: true,
        component_whitelist: ["Headline"],
      }),
      subline_ref: bloksField({
        display_name: "Subline",
        maximum: 1,
        restrict_components: true,
        translatable: false,
        component_whitelist: ["Text"],
      }),
      text_ref: bloksField({
        display_name: "Text",
        translatable: false,
        maximum: 1,
        restrict_components: true,
        component_whitelist: ["Text"],
      }),
      images: bloksField({
        display_name: "Images",
        translatable: false,
        restrict_components: true,
        component_whitelist: ["Image"],
      }),
      color_background: customField({
        field_type: "storyblok-colorpicker",
        options: [],
      }),
      color_border: customField({
        field_type: "storyblok-colorpicker",
        options: [],
      }),
      cta_content: bloksField({
        display_name: "Links",
        restrict_components: true,
        component_whitelist: ["Link"],
      }),
      id: textField({
        display_name: "Id",
        regex: "^([a-zA-Z]+(?:[a-zA-Z0-9\\-_.:]+)*)*$",
        description:
          'Id of this element (must start with letter)\n(only characters, numbers, "_", ".", ":" and "-",eg. "Test-Id-2")',
      }),
      text_placement: optionField({
        display_name: "Text Placement",
        source: "internal",
        default_value: "left",
        datasource_slug: "text-align",
      }),
      margin_top: optionField({
        display_name: "Margin Top",
        source: "internal",
        default_value: "none",
        datasource_slug: "margin",
      }),
      in_container: booleanField({
        display_name: "In Container",
        default_value: false,
      }),
      creative_name: textField({
        display_name: "Creative Name",
      }),
      promotion_name: textField({
        display_name: "Promotion Name",
      }),
    },
    tabs: {
      general: [
        "headline_ref",
        "subline_ref",
        "text_ref",
        "images",
        "cta_content",
      ],
      settings: [
        "id",
        "margin_top",
        "text_placement",
        "color_background",
        "color_border",
        "in_container",
        "creative_name",
        "promotion_name",
      ],
    },
  },
});
