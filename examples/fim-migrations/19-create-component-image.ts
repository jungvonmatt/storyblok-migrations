import {
  defineMigration,
  assetField,
  textField,
  optionField,
  booleanField,
  customField,
} from "sb-migrate";

export default defineMigration({
  type: "create-component",
  schema: {
    name: "Image",
    display_name: "Image",
    is_root: false,
    is_nestable: true,
    component_group_name: "Media",
    schema: {
      desktop_image: assetField({
        filetypes: ["images"],
        description: "Leave empty to show the mobile image on all screen sizes",
        display_name: "Image",
        translatable: true,
      }),
      mobile_image: assetField({
        filetypes: ["images"],
        description: "Leave empty to disable the image on mobile",
        translatable: true,
      }),
      background_color: customField({
        field_type: "storyblok-colorpicker",
        options: [],
      }),
      id: textField({
        display_name: "Id",
        regex: "^([a-zA-Z]+(?:[a-zA-Z0-9\\-_.:]+)*)*$",
        description:
          'Id of this element (must start with letter)\n(only characters, numbers, "_", ".", ":" and "-",eg. "Test-Id-2")',
      }),
      object_fit: optionField({
        display_name: "Object Fit",
        source: "internal",
        default_value: "scale-down",
        datasource_slug: "object-fit",
      }),
      object_position: optionField({
        display_name: "Object Position",
        source: "internal",
        default_value: "center",
        datasource_slug: "object-position",
      }),
      layout: optionField({
        display_name: "Layout",
        source: "internal",
        default_value: "raw",
        datasource_slug: "image-layout",
      }),
      mobile_ratio: optionField({
        display_name: "Mobile Ratio",
        source: "internal",
        datasource_slug: "image-ratio",
      }),
      desktop_ratio: optionField({
        display_name: "Desktop Ratio",
        source: "internal",
        datasource_slug: "image-ratio",
      }),
      hide_mobile: booleanField({
        display_name: "Hide Mobile",
        default_value: false,
      }),
      include_disclaimer: booleanField({
        display_name: "Include Disclaimer",
        default_value: false,
      }),
      warning_text: textField({
        translatable: true,
      }),
      warning_color: customField({
        field_type: "storyblok-colorpicker",
        options: [],
      }),
      warning_background_color: customField({
        field_type: "storyblok-colorpicker",
        options: [],
      }),
      disclaimer_text: textField({
        translatable: true,
      }),
      disclaimer_color: customField({
        field_type: "storyblok-colorpicker",
        options: [],
      }),
      disclaimer_background_color: customField({
        field_type: "storyblok-colorpicker",
        options: [],
      }),
      disclaimer_position: optionField({
        display_name: "Disclaimer Position",
        source: "self",
        options: [
          {
            value: "on-image",
            name: "On Image",
          },
          {
            value: "below-image",
            name: "Below Image",
          },
        ],
        default_value: "on-image",
        exclude_empty_option: true,
      }),
      creative_name: textField({
        display_name: "Creative Name",
      }),
      promotion_name: textField({
        display_name: "Promotion Name",
      }),
    },
    tabs: {
      general: ["desktop_image", "mobile_image", "background_color"],
      settings: [
        "id",
        "object_fit",
        "object_position",
        "layout",
        "mobile_ratio",
        "desktop_ratio",
        "hide_mobile",
        "creative_name",
        "promotion_name",
      ],
      disclaimer: [
        "include_disclaimer",
        "warning_text",
        "warning_color",
        "warning_background_color",
        "disclaimer_text",
        "disclaimer_color",
        "disclaimer_background_color",
        "disclaimer_position",
      ],
    },
  },
});
