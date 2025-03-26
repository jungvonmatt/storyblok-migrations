/* eslint-disable no-undef */
const type = "create-component";

const schema = {
  name: "image",
  display_name: "Image",
  is_root: false,
  is_nestable: true,
  component_group_name: "Media",

  schema: {
    desktop_image: {
      type: "asset",
      filetypes: ["images"],
      display_name: "Desktop Image",
      description: "Image for desktop devices",
      translatable: true,
    },
    mobile_image: {
      type: "asset",
      filetypes: ["images"],
      display_name: "Mobile Image (optional)",
      description: "If empty, desktop image will be used",
      translatable: true,
    },
    alt_text: {
      type: "text",
      display_name: "Alt Text",
      description: "Accessible description of the image",
      translatable: true,
    },
    object_fit: {
      type: "option",
      display_name: "Object Fit",
      source: "internal",
      datasource_slug: "object-fit",
      default_value: "cover",
    },
    object_position: {
      type: "option",
      display_name: "Object Position",
      source: "internal",
      datasource_slug: "object-position",
      default_value: "center",
    },
    background_color: {
      type: "custom",
      field_type: "storyblok-colorpicker",
      display_name: "Background Color",
      options: [],
    },
    id: {
      type: "text",
      display_name: "ID",
      regex: "^([a-zA-Z]+(?:[a-zA-Z0-9\\-_.:]+)*)*$",
      description: "ID attribute (must start with letter)",
    },
  },

  tabs: {
    general: ["desktop_image", "mobile_image", "alt_text"],
    settings: ["object_fit", "object_position", "background_color", "id"],
  },
};

module.exports = { type, schema };
