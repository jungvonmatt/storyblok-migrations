import {
  defineMigration,
  textField,
  booleanField,
  optionField,
} from "sb-migrate";

export default defineMigration({
  type: "create-component",
  schema: {
    name: "link",
    display_name: "Link",
    is_root: false,
    is_nestable: true,
    component_group_name: "Contents",

    schema: {
      text: textField({
        display_name: "Link Text",
        translatable: true,
        required: true,
      }),
      url: textField({
        display_name: "URL",
        required: true,
        translatable: true,
        description: "External URL or internal path",
      }),
      target_blank: booleanField({
        display_name: "Open in new tab",
      }),
      appearance: optionField({
        display_name: "Appearance",
        source: "self",
        options: [
          { value: "text", name: "Text Link" },
          { value: "button", name: "Button" },
          { value: "button-outline", name: "Button Outline" },
        ],
        default_value: "text",
      }),
      id: textField({
        display_name: "ID",
        regex: "^([a-zA-Z]+(?:[a-zA-Z0-9\\-_.:]+)*)*$",
        description: "ID attribute (must start with letter)",
      }),
    },

    tabs: {
      general: ["text", "url", "target_blank", "appearance"],
      settings: ["id"],
    },
  },
});
